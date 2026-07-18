package com.elevateresume.backend.resume;

import com.elevateresume.backend.shared.ApiException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ResumeDocumentParser {

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_REQUIRED", "No resume file uploaded.");
        }

        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
        String contentType = file.getContentType() == null ? "" : file.getContentType();

        try {
            byte[] bytes = file.getBytes();
            String text;
            if (contentType.equals("application/pdf") || filename.endsWith(".pdf")) {
                text = extractPdf(bytes);
            } else if (contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                    || filename.endsWith(".docx")) {
                text = extractDocx(bytes);
            } else {
                text = new String(bytes, StandardCharsets.UTF_8);
            }

            if (text == null || text.trim().length() < 50) {
                throw new ApiException(
                        HttpStatus.BAD_REQUEST,
                        "TEXT_EXTRACTION_FAILED",
                        "Unable to extract sufficient text from the uploaded file.");
            }
            return text;
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_READ_FAILED", exception.getMessage());
        }
    }

    private String extractPdf(byte[] bytes) throws IOException {
        try (PDDocument document = Loader.loadPDF(bytes)) {
            return new PDFTextStripper().getText(document);
        } catch (IOException exception) {
            return new String(bytes, StandardCharsets.UTF_8)
                    .replaceAll("[\\x00-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f-\\xff]", " ");
        }
    }

    private String extractDocx(byte[] bytes) throws IOException {
        try (XWPFDocument document = new XWPFDocument(new ByteArrayInputStream(bytes));
                XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        } catch (IOException exception) {
            return new String(bytes, StandardCharsets.UTF_8);
        }
    }
}
