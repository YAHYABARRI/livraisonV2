package com.quickship.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.quickship.entity.Parcel;
import com.quickship.util.QrCodeGenerator;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.awt.Color;

@Service
public class InvoiceService {

    public byte[] generateInvoicePdf(Parcel parcel) {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            // Colors matching styling rules
            Color primaryColor = new Color(37, 99, 235); // #2563EB
            Color accentColor = new Color(249, 115, 22); // #F97316
            Color darkColor = new Color(30, 41, 59);    // Slate 800
            Color lightColor = new Color(241, 245, 249); // Slate 100

            // Header Layout: Table with 2 columns
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{3f, 2f});

            // Left Cell: Logo and Brand Name
            PdfPCell leftCell = new PdfPCell();
            leftCell.setBorder(Rectangle.NO_BORDER);
            
            // Try loading logo
            try (InputStream is = getClass().getResourceAsStream("/logo-dark.png")) {
                if (is != null) {
                    byte[] logoBytes = is.readAllBytes();
                    Image logoImg = Image.getInstance(logoBytes);
                    logoImg.scaleToFit(140, 56);
                    leftCell.addElement(logoImg);
                }
            } catch (Exception e) {
                // Ignore and fall back to text logo
            }
            
            Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryColor);
            Paragraph brandName = new Paragraph("AFRIDEEX", brandFont);
            brandName.setSpacingBefore(5);
            leftCell.addElement(brandName);
            
            Font companyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkColor);
            leftCell.addElement(new Paragraph("AFRIDEEX Logistics\nCasablanca, Maroc\ncontact@afrideex.ma", companyFont));
            headerTable.addCell(leftCell);

            // Right Cell: Invoice details
            PdfPCell rightCell = new PdfPCell();
            rightCell.setBorder(Rectangle.NO_BORDER);
            rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            
            Font invoiceTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, accentColor);
            Paragraph invoiceTitle = new Paragraph("FACTURE", invoiceTitleFont);
            invoiceTitle.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(invoiceTitle);
            
            Font detailsFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkColor);
            String invoiceNo = "INV-" + parcel.getTrackingId().substring(3, 11) + "-" + parcel.getId();
            String invoiceDate = parcel.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            
            Paragraph details = new Paragraph(
                "N° Facture : " + invoiceNo + "\n" +
                "Date : " + invoiceDate + "\n" +
                "Suivi # : " + parcel.getTrackingId(), 
                detailsFont
            );
            details.setAlignment(Element.ALIGN_RIGHT);
            details.setSpacingBefore(10);
            rightCell.addElement(details);
            headerTable.addCell(rightCell);

            headerTable.setSpacingAfter(10);
            document.add(headerTable);

            // Spacer line
            document.add(new Chunk(new LineSeparator(1f, 100, darkColor, Element.ALIGN_CENTER, -10)));
            document.add(new Paragraph("\n"));

            // Client & Shipment Info Section
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{1f, 1f});

            // Client Info (Left)
            PdfPCell clientCell = new PdfPCell();
            clientCell.setBorder(Rectangle.NO_BORDER);
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, primaryColor);
            clientCell.addElement(new Paragraph("CLIENT / EXPÉDITEUR", sectionTitleFont));
            
            Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkColor);
            Paragraph clientInfo = new Paragraph(
                "Nom : " + parcel.getClient().getFirstName() + " " + parcel.getClient().getLastName() + "\n" +
                "Email : " + parcel.getClient().getEmail() + "\n" +
                "Téléphone : " + (parcel.getClient().getPhone() != null ? parcel.getClient().getPhone() : "N/A") + "\n" +
                "Adresse de collecte : " + parcel.getPickupAddress(),
                infoFont
            );
            clientInfo.setSpacingBefore(5);
            clientCell.addElement(clientInfo);
            infoTable.addCell(clientCell);

            // Destinataire Info (Right)
            PdfPCell destCell = new PdfPCell();
            destCell.setBorder(Rectangle.NO_BORDER);
            destCell.addElement(new Paragraph("DESTINATAIRE / LIVRAISON", sectionTitleFont));
            
            Paragraph destInfo = new Paragraph(
                "Nom : " + parcel.getRecipientName() + "\n" +
                "Téléphone : " + parcel.getRecipientPhone() + "\n" +
                "Ville : " + parcelCity(parcel) + "\n" +
                "Adresse de livraison : " + parcel.getDeliveryAddress(),
                infoFont
            );
            destInfo.setSpacingBefore(5);
            destCell.addElement(destInfo);
            infoTable.addCell(destCell);

            document.add(infoTable);
            document.add(new Paragraph("\n"));

            // Details Table
            PdfPTable detailsTable = new PdfPTable(4);
            detailsTable.setWidthPercentage(100);
            detailsTable.setWidths(new float[]{3f, 1.5f, 1.5f, 2f});
            
            // Table Header
            Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"Description / Type de colis", "Poids", "Statut", "Prix d'expédition"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(header, tableHeaderFont));
                cell.setBackgroundColor(primaryColor);
                cell.setPadding(8);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                detailsTable.addCell(cell);
            }

            // Table Content
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkColor);
            
            String desc = "Colis - " + (parcel.getParcelType() != null ? parcel.getParcelType() : "Standard");
            if (parcel.getDescription() != null && !parcel.getDescription().isEmpty()) {
                desc += "\n(" + parcel.getDescription() + ")";
            }
            PdfPCell c1 = new PdfPCell(new Paragraph(desc, cellFont));
            c1.setPadding(8);
            detailsTable.addCell(c1);

            PdfPCell c2 = new PdfPCell(new Paragraph(parcel.getWeight() + " kg", cellFont));
            c2.setPadding(8);
            c2.setHorizontalAlignment(Element.ALIGN_CENTER);
            detailsTable.addCell(c2);

            PdfPCell c3 = new PdfPCell(new Paragraph(parcel.getStatus().name(), cellFont));
            c3.setPadding(8);
            c3.setHorizontalAlignment(Element.ALIGN_CENTER);
            detailsTable.addCell(c3);

            String priceFormatted = String.format("%.2f DH", parcel.getShippingPrice() != null ? parcel.getShippingPrice() : 0.0);
            PdfPCell c4 = new PdfPCell(new Paragraph(priceFormatted, cellFont));
            c4.setPadding(8);
            c4.setHorizontalAlignment(Element.ALIGN_RIGHT);
            detailsTable.addCell(c4);

            document.add(detailsTable);
            document.add(new Paragraph("\n"));

            // Total and QR Code section
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);
            footerTable.setWidths(new float[]{1.2f, 1f});

            // QR Code
            PdfPCell qrCell = new PdfPCell();
            qrCell.setBorder(Rectangle.NO_BORDER);
            qrCell.addElement(new Paragraph("SCANNER POUR SUIVRE", sectionTitleFont));
            
            String trackingUrl = "http://localhost:5173/track/" + parcel.getTrackingId();
            try {
                byte[] qrBytes = QrCodeGenerator.generateQrCodeImage(trackingUrl, 100, 100);
                Image qrImg = Image.getInstance(qrBytes);
                qrImg.setSpacingBefore(5);
                qrCell.addElement(qrImg);
            } catch (Exception e) {
                qrCell.addElement(new Paragraph("[QR Code indisponible]", infoFont));
            }
            footerTable.addCell(qrCell);

            // Pricing summary
            PdfPCell summaryCell = new PdfPCell();
            summaryCell.setBorder(Rectangle.NO_BORDER);
            summaryCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            
            Font totalValFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, accentColor);
            
            Paragraph totalSection = new Paragraph();
            totalSection.setAlignment(Element.ALIGN_RIGHT);
            totalSection.add(new Chunk("Total HT : " + priceFormatted + "\n", cellFont));
            totalSection.add(new Chunk("TVA (0%) : 0.00 DH\n", cellFont));
            totalSection.add(new Chunk("TOTAL TTC : " + priceFormatted + "\n", totalValFont));
            
            summaryCell.addElement(totalSection);
            
            Paragraph paymentNotice = new Paragraph("\nFacture acquittée.\nMerci pour votre confiance !", FontFactory.getFont(FontFactory.HELVETICA, 9, Font.ITALIC, darkColor));
            paymentNotice.setAlignment(Element.ALIGN_RIGHT);
            summaryCell.addElement(paymentNotice);
            
            footerTable.addCell(summaryCell);

            document.add(footerTable);

            // Footer notes
            document.add(new Paragraph("\n\n\n"));
            Paragraph terms = new Paragraph("Conditions de livraison standard. Pour toute réclamation, veuillez contacter notre support technique à support@afrideex.ma.", FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY));
            terms.setAlignment(Element.ALIGN_CENTER);
            document.add(terms);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    private String parcelCity(Parcel parcel) {
        if (parcel.getDeliveryCity() != null && !parcel.getDeliveryCity().isBlank()) {
            return parcel.getDeliveryCity();
        }
        return "N/A";
    }
}
