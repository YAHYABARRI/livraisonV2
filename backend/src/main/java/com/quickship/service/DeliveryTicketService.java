package com.quickship.service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.quickship.entity.Parcel;
import com.quickship.entity.ParcelStatus;
import com.quickship.exception.BadRequestException;
import com.quickship.exception.UnauthorizedException;
import com.quickship.repository.ParcelRepository;
import com.quickship.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class DeliveryTicketService {

    private static final String COMPANY_NAME = "AFRIDEEX";
    private static final String COMPANY_WEBSITE = "www.afrideex.ma";
    private static final String COMPANY_PHONE = "+212 701 212 524";
    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Autowired
    private ParcelRepository parcelRepository;

    @Transactional(readOnly = true)
    public byte[] generateTicketsByIds(List<Long> parcelIds, UserPrincipal userPrincipal) {
        if (parcelIds == null || parcelIds.isEmpty()) {
            throw new BadRequestException("Sélectionnez au moins une commande");
        }

        List<Parcel> parcels = isAdmin(userPrincipal)
                ? parcelRepository.findByIdInOrderByCreatedAtDesc(parcelIds)
                : parcelRepository.findByClientIdAndIdInOrderByCreatedAtDesc(userPrincipal.getId(), parcelIds);

        if (!isAdmin(userPrincipal) && parcels.size() != parcelIds.stream().distinct().count()) {
            throw new UnauthorizedException("Vous ne pouvez générer que les tickets de vos propres commandes");
        }
        if (parcels.isEmpty()) {
            throw new BadRequestException("Aucune commande trouvée pour générer les tickets");
        }

        return generateTicketsPdf(parcels);
    }

    @Transactional(readOnly = true)
    public byte[] generateTicketsByDate(LocalDate date, UserPrincipal userPrincipal) {
        if (date == null) {
            throw new BadRequestException("La date est obligatoire");
        }

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        List<Parcel> parcels = isAdmin(userPrincipal)
                ? parcelRepository.findCreatedOrStatusLoggedBetween(start, end, ParcelStatus.ACCEPTED)
                : parcelRepository.findClientCreatedOrStatusLoggedBetween(userPrincipal.getId(), start, end, ParcelStatus.ACCEPTED);

        if (parcels.isEmpty()) {
            throw new BadRequestException("Aucune commande trouvée pour cette date");
        }

        return generateTicketsPdf(parcels);
    }

    private byte[] generateTicketsPdf(List<Parcel> parcels) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 24, 24, 24, 24);
            PdfWriter.getInstance(document, out);
            document.open();

            PdfPTable grid = new PdfPTable(2);
            grid.setWidthPercentage(100);
            grid.setWidths(new float[]{1f, 1f});
            grid.getDefaultCell().setBorder(Rectangle.NO_BORDER);
            grid.setSplitLate(false);
            grid.setSplitRows(false);

            for (Parcel parcel : parcels) {
                PdfPCell wrapper = new PdfPCell(createTicket(parcel));
                wrapper.setBorder(Rectangle.NO_BORDER);
                wrapper.setPadding(4f);
                wrapper.setFixedHeight(260f);
                grid.addCell(wrapper);
            }

            if (parcels.size() % 2 != 0) {
                PdfPCell empty = new PdfPCell(new Phrase(""));
                empty.setBorder(Rectangle.NO_BORDER);
                empty.setFixedHeight(260f);
                grid.addCell(empty);
            }

            document.add(grid);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération des tickets PDF", e);
        }
    }

    private PdfPTable createTicket(Parcel parcel) throws DocumentException {
        Font disclaimerFont = new Font(Font.HELVETICA, 6.8f, Font.NORMAL, Color.BLACK);
        Font labelFont = new Font(Font.HELVETICA, 7.2f, Font.BOLD, Color.BLACK);
        Font valueFont = new Font(Font.HELVETICA, 7.2f, Font.NORMAL, Color.BLACK);
        Font titleFont = new Font(Font.HELVETICA, 9f, Font.BOLD, Color.BLACK);
        Font orderFont = new Font(Font.HELVETICA, 10.5f, Font.BOLD, Color.BLACK);

        PdfPTable ticket = new PdfPTable(1);
        ticket.setWidthPercentage(100);
        ticket.getDefaultCell().setBorder(Rectangle.NO_BORDER);

        PdfPCell container = new PdfPCell();
        container.setBorder(Rectangle.BOX);
        container.setBorderColor(Color.BLACK);
        container.setBorderWidth(1.1f);
        container.setPadding(6f);
        container.setUseAscender(true);
        container.setUseDescender(true);

        Image logo = loadLogo(88f, 38f);
        if (logo != null) {
            logo.setAlignment(Element.ALIGN_CENTER);
            logo.setSpacingAfter(3f);
            container.addElement(logo);
        }

        Paragraph disclaimer = new Paragraph(
                COMPANY_NAME + " n'est qu'une société de livraison, et n'est pas responsable du contenu de ce colis. En cas de problème, veuillez contacter le vendeur.",
                disclaimerFont
        );
        disclaimer.setLeading(8f);
        disclaimer.setAlignment(Element.ALIGN_CENTER);
        container.addElement(disclaimer);
        container.addElement(dottedSeparator());

        Paragraph order = new Paragraph(safe(parcel.getTrackingId()), orderFont);
        order.setAlignment(Element.ALIGN_CENTER);
        order.setSpacingAfter(3f);
        container.addElement(order);

        PdfPTable customer = new PdfPTable(new float[]{0.32f, 0.68f});
        customer.setWidthPercentage(100);
        addRow(customer, "Nom complet", parcel.getRecipientName(), labelFont, valueFont);
        addRow(customer, "Ville", parcelCity(parcel), labelFont, valueFont);
        addRow(customer, "Adresse", parcel.getDeliveryAddress(), labelFont, valueFont);
        addRow(customer, "Téléphone", parcel.getRecipientPhone(), labelFont, valueFont);
        container.addElement(customer);
        container.addElement(dottedSeparator());

        Paragraph section = new Paragraph("INFORMATIONS COMMANDE", titleFont);
        section.setSpacingAfter(3f);
        container.addElement(section);

        PdfPTable orderInfo = new PdfPTable(new float[]{0.36f, 0.64f});
        orderInfo.setWidthPercentage(100);
        addRow(orderInfo, "Vendeur", sellerName(parcel), labelFont, valueFont);
        addRow(orderInfo, "Note", note(parcel), labelFont, valueFont);
        addRow(orderInfo, "Échange", isExchange(parcel) ? "Oui" : "Non", labelFont, valueFont);
        addRow(orderInfo, "Prix", formatMoney(parcel.getShippingPrice()), labelFont, valueFont);
        addRow(orderInfo, "Produits", productLine(parcel), labelFont, valueFont);
        container.addElement(orderInfo);
        container.addElement(dottedSeparator());

        PdfPTable footer = new PdfPTable(new float[]{0.54f, 0.46f});
        footer.setWidthPercentage(100);
        addFooterCell(footer, "Site web\n" + COMPANY_WEBSITE, valueFont);
        addFooterCell(footer, "Téléphone\n" + COMPANY_PHONE, valueFont);
        addFooterCell(footer, "Date\n" + LocalDateTime.now().format(DISPLAY_DATE), valueFont);
        addFooterCell(footer, "Commande\n" + safe(parcel.getTrackingNumber()), valueFont);
        container.addElement(footer);

        ticket.addCell(container);
        return ticket;
    }

    private void addRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label + " :", labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(1.5f);
        labelCell.setVerticalAlignment(Element.ALIGN_TOP);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(safe(value), valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(1.5f);
        valueCell.setVerticalAlignment(Element.ALIGN_TOP);
        table.addCell(valueCell);
    }

    private void addFooterCell(PdfPTable table, String value, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(value, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(2f);
        table.addCell(cell);
    }

    private Image loadLogo(float maxWidth, float maxHeight) {
        try (InputStream is = getClass().getResourceAsStream("/logo-dark.png")) {
            if (is == null) {
                return null;
            }
            Image logo = Image.getInstance(is.readAllBytes());
            logo.scaleToFit(maxWidth, maxHeight);
            return logo;
        } catch (Exception e) {
            return null;
        }
    }

    private Paragraph dottedSeparator() {
        Paragraph separator = new Paragraph("· · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ·", new Font(Font.HELVETICA, 7f, Font.NORMAL, Color.BLACK));
        separator.setAlignment(Element.ALIGN_CENTER);
        separator.setSpacingBefore(2f);
        separator.setSpacingAfter(2f);
        return separator;
    }

    private boolean isAdmin(UserPrincipal userPrincipal) {
        return userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ADMIN"::equals);
    }

    private String sellerName(Parcel parcel) {
        if (parcel.getClient() == null) {
            return "N/A";
        }
        return safe(parcel.getClient().getFirstName()) + " " + safe(parcel.getClient().getLastName());
    }

    private String note(Parcel parcel) {
        return parcel.getDescription() == null || parcel.getDescription().isBlank()
                ? "Aucune note"
                : parcel.getDescription();
    }

    private boolean isExchange(Parcel parcel) {
        String note = parcel.getDescription();
        if (note == null) {
            return false;
        }
        String normalized = note.toLowerCase()
                .replace("é", "e")
                .replace("è", "e")
                .replace("ê", "e");
        return normalized.contains("echange");
    }

    private String productLine(Parcel parcel) {
        String product = parcel.getParcelType() == null || parcel.getParcelType().isBlank()
                ? "Colis"
                : parcel.getParcelType();
        return "1 x " + product;
    }

    private String extractCity(String address) {
        if (address == null || address.isBlank()) {
            return "N/A";
        }
        String[] parts = address.split(",");
        String city = parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
        return city.isBlank() ? address : city;
    }

    private String parcelCity(Parcel parcel) {
        if (parcel.getDeliveryCity() != null && !parcel.getDeliveryCity().isBlank()) {
            return parcel.getDeliveryCity();
        }
        return "N/A";
    }

    private String formatMoney(Double value) {
        return String.format("%.2f DH", value != null ? value : 0.0);
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "N/A" : value;
    }
}
