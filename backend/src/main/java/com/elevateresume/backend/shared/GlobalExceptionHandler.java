package com.elevateresume.backend.shared;

import jakarta.servlet.http.HttpServletRequest;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NoResourceFoundException.class)
    ResponseEntity<ApiResponses.ErrorEnvelope> handleNoResourceFound(NoResourceFoundException exception, HttpServletRequest request) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error("NOT_FOUND", exception.getMessage(), request));
    }

    @ExceptionHandler(ApiException.class)
    ResponseEntity<ApiResponses.ErrorEnvelope> handleApiException(ApiException exception, HttpServletRequest request) {
        return ResponseEntity
                .status(exception.getStatus())
                .body(error(exception.getCode(), exception.getMessage(), request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponses.ErrorEnvelope> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::formatFieldError)
                .collect(Collectors.joining("; "));

        return ResponseEntity
                .badRequest()
                .body(error("VALIDATION_FAILED", message, request));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ResponseEntity<ApiResponses.ErrorEnvelope> handleUploadSize(
            MaxUploadSizeExceededException exception,
            HttpServletRequest request) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(error("FILE_TOO_LARGE", "Uploaded resume file must be 10MB or smaller.", request));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponses.ErrorEnvelope> handleUnexpected(Exception exception, HttpServletRequest request) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error("INTERNAL_SERVER_ERROR", exception.getMessage(), request));
    }

    private String formatFieldError(FieldError fieldError) {
        return fieldError.getField() + " " + fieldError.getDefaultMessage();
    }

    private ApiResponses.ErrorEnvelope error(String code, String message, HttpServletRequest request) {
        String requestId = request.getHeader("x-request-id");
        if (requestId == null || requestId.isBlank()) {
            requestId = "req-" + System.currentTimeMillis();
        }
        return new ApiResponses.ErrorEnvelope(new ApiResponses.ErrorBody(code, message, requestId));
    }
}
