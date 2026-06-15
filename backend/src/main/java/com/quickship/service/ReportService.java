package com.quickship.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.quickship.dto.ReportStatsResponse;
import com.quickship.entity.Parcel;
import com.quickship.entity.ParcelStatus;
import com.quickship.entity.User;
import com.quickship.repository.ParcelRepository;
import com.quickship.repository.UserRepository;
import com.quickship.specification.ParcelSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ParcelRepository parcelRepository;

    @Autowired
    private UserRepository userRepository;

    public ReportStatsResponse getReportStats() {
        List<Parcel> parcels = parcelRepository.findAll();

        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        LocalDateTime startOfMonth = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIDNIGHT);

        double revenueToday = parcels.stream()
                .filter(p -> p.getCreatedAt().isAfter(startOfDay) && p.getCreatedAt().isBefore(endOfDay))
                .mapToDouble(p -> p.getShippingPrice() != null ? p.getShippingPrice() : 0.0)
                .sum();

        double revenueMonth = parcels.stream()
                .filter(p -> p.getCreatedAt().isAfter(startOfMonth))
                .mapToDouble(p -> p.getShippingPrice() != null ? p.getShippingPrice() : 0.0)
                .sum();

        long deliveredCount = parcels.stream()
                .filter(p -> p.getStatus() == ParcelStatus.DELIVERED)
                .count();

        long pendingCount = parcels.stream()
                .filter(p -> p.getStatus() != ParcelStatus.DELIVERED && p.getStatus() != ParcelStatus.RETURNED)
                .count();

        long returnedCount = parcels.stream()
                .filter(p -> p.getStatus() == ParcelStatus.RETURNED)
                .count();

        return ReportStatsResponse.builder()
                .revenueToday(revenueToday)
                .revenueMonth(revenueMonth)
                .deliveredCount(deliveredCount)
                .pendingCount(pendingCount)
                .returnedCount(returnedCount)
                .build();
    }

    public byte[] generatePdfReport(
            LocalDateTime startDate,
            LocalDateTime endDate,
            Long driverId,
            Long clientId,
            List<Long> clientIds,
            List<ParcelStatus> statuses,
            String periodLabel
    ) {
        Specification<Parcel> spec = ParcelSpecification.filterParcels(
                startDate, endDate, driverId, clientId, clientIds, statuses
        );

        List<Parcel> parcels = parcelRepository.findAll(spec);

        User driver = null;
        if (driverId != null) {
            driver = userRepository.findById(driverId).orElse(null);
        }

        Document document = new Document(PageSize.A4, 36, 36, 104, 56);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            String driverName = driver != null ? driver.getFirstName() + " " + driver.getLastName() : "Tous les livreurs";
            String driverPhone = driver != null && driver.getPhone() != null ? driver.getPhone() : "N/A";
            String docDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            writer.setPageEvent(new ReportPageEvent(driverName, driverPhone, parcels.size(), docDate));

            document.open();

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.55f, 2.05f, 2.35f, 1.55f, 1.75f, 1.15f});
            table.setHeaderRows(1);

            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            String[] headers = {"N°", "Code de Colis", "Destinataire", "Téléphone", "Ville", "Total"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(header, tableHeaderFont));
                cell.setBackgroundColor(Color.WHITE);
                cell.setBorderColor(Color.BLACK);
                cell.setPadding(5);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                table.addCell(cell);
            }

            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
            int index = 1;
            double totalRevenue = 0.0;

            for (Parcel parcel : parcels) {
                table.addCell(createCenterCell(String.valueOf(index++), cellFont));
                table.addCell(createLeftCell(parcel.getTrackingId(), cellFont));
                table.addCell(createLeftCell(parcel.getRecipientName(), cellFont));
                table.addCell(createCenterCell(parcel.getRecipientPhone(), cellFont));
                table.addCell(createLeftCell(parcelCity(parcel), cellFont));

                double price = parcel.getShippingPrice() != null ? parcel.getShippingPrice() : 0.0;
                totalRevenue += price;
                table.addCell(createRightCell(formatMoney(price), cellFont));
            }

            table.setSpacingAfter(12);
            document.add(table);

            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(100);
            totalTable.setWidths(new float[]{4f, 1.15f});
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            totalTable.addCell(createRightCell("Total général", totalFont));
            totalTable.addCell(createRightCell(formatMoney(totalRevenue), totalFont));
            totalTable.setSpacingAfter(34);
            document.add(totalTable);

            PdfPTable signaturesTable = new PdfPTable(2);
            signaturesTable.setWidthPercentage(100);
            signaturesTable.setWidths(new float[]{1f, 1f});
            signaturesTable.setSpacingBefore(6);
            Font signatureFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            signaturesTable.addCell(createSignatureCell("Signature Client", signatureFont));
            signaturesTable.addCell(createSignatureCell("Signature Ramasseur (ou Livreur)", signatureFont));
            document.add(signaturesTable);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    private PdfPCell createLeftCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(safe(text), font));
        cell.setPadding(4);
        cell.setBorderColor(Color.BLACK);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private PdfPCell createCenterCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(safe(text), font));
        cell.setPadding(4);
        cell.setBorderColor(Color.BLACK);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private PdfPCell createRightCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(safe(text), font));
        cell.setPadding(4);
        cell.setBorderColor(Color.BLACK);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }

    private PdfPCell createSignatureCell(String label, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(label, font));
        cell.setBorderColor(Color.BLACK);
        cell.setFixedHeight(70);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        cell.setVerticalAlignment(Element.ALIGN_TOP);
        return cell;
    }

    private String extractCity(String address) {
        if (address == null) return "N/A";
        String[] parts = address.split(",");
        if (parts.length > 1) {
            return parts[parts.length - 1].trim();
        }
        return address.length() > 20 ? address.substring(0, 17) + "..." : address;
    }

    private String parcelCity(Parcel parcel) {
        if (parcel.getDeliveryCity() != null && !parcel.getDeliveryCity().isBlank()) {
            return parcel.getDeliveryCity();
        }
        return "N/A";
    }

    private String formatMoney(double value) {
        return String.format("%.2f DH", value);
    }

    private String safe(String text) {
        return text != null ? text : "";
    }

    private static class ReportPageEvent extends PdfPageEventHelper {
        private final String driverName;
        private final String driverPhone;
        private final int parcelCount;
        private final String docDate;

        private ReportPageEvent(String driverName, String driverPhone, int parcelCount, String docDate) {
            this.driverName = driverName;
            this.driverPhone = driverPhone;
            this.parcelCount = parcelCount;
            this.docDate = docDate;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            try {
                PdfPTable header = createHeaderTable();
                header.setTotalWidth(document.right() - document.left());
                header.writeSelectedRows(0, -1, document.left(), document.getPageSize().getHeight() - 24, writer.getDirectContent());

                Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
                Phrase pageNumber = new Phrase("Page " + writer.getPageNumber(), footerFont);
                ColumnText.showTextAligned(
                        writer.getDirectContent(),
                        Element.ALIGN_CENTER,
                        pageNumber,
                        (document.right() + document.left()) / 2,
                        document.bottom() - 18,
                        0
                );
            } catch (DocumentException e) {
                throw new ExceptionConverter(e);
            }
        }

        private PdfPTable createHeaderTable() throws DocumentException {
            PdfPTable header = new PdfPTable(2);
            header.setWidths(new float[]{3.25f, 1.15f});
            header.getDefaultCell().setBorder(Rectangle.NO_BORDER);

            Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            Font valueFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);

            PdfPTable info = new PdfPTable(2);
            info.setWidths(new float[]{1.35f, 3f});
            info.getDefaultCell().setBorder(Rectangle.NO_BORDER);
            addHeaderRow(info, "Nom du livreur", driverName, labelFont, valueFont);
            addHeaderRow(info, "T\u00e9l\u00e9phone du livreur", driverPhone, labelFont, valueFont);
            addHeaderRow(info, "Nombre de colis", String.valueOf(parcelCount), labelFont, valueFont);
            addHeaderRow(info, "Date", docDate, labelFont, valueFont);
            addHeaderRow(info, "Livreur Agence", "AFRIDEEX Agence", labelFont, valueFont);

            PdfPCell infoCell = new PdfPCell(info);
            infoCell.setBorder(Rectangle.NO_BORDER);
            infoCell.setPadding(0);
            header.addCell(infoCell);

            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(Rectangle.NO_BORDER);
            logoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            logoCell.setVerticalAlignment(Element.ALIGN_TOP);
            logoCell.setPadding(0);
            Image logo = loadLogo();
            if (logo != null) {
                logo.setAlignment(Element.ALIGN_RIGHT);
                logoCell.addElement(logo);
            }
            header.addCell(logoCell);

            PdfPCell separator = new PdfPCell(new Phrase(""));
            separator.setColspan(2);
            separator.setFixedHeight(8);
            separator.setBorder(Rectangle.BOTTOM);
            separator.setBorderColor(Color.BLACK);
            header.addCell(separator);
            return header;
        }

        private Image loadLogo() {
            try (InputStream is = ReportService.class.getResourceAsStream("/logo-dark.png")) {
                if (is == null) {
                    return null;
                }
                Image logo = Image.getInstance(is.readAllBytes());
                logo.scaleToFit(92f, 34f);
                return logo;
            } catch (Exception e) {
                return null;
            }
        }

        private void addHeaderRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
            PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
            labelCell.setBorder(Rectangle.NO_BORDER);
            labelCell.setPadding(1.6f);
            table.addCell(labelCell);

            PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value : "", valueFont));
            valueCell.setBorder(Rectangle.NO_BORDER);
            valueCell.setPadding(1.6f);
            table.addCell(valueCell);
        }
    }
}
