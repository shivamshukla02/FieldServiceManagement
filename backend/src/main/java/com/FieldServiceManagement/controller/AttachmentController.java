package com.FieldServiceManagement.controller;

import com.FieldServiceManagement.domain.Attachment;
import com.FieldServiceManagement.service.AttachmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/upload/{workOrderId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'DISPATCHER', 'MANAGER')")
    public ResponseEntity<Attachment> upload(@RequestParam MultipartFile file,
                                              @PathVariable Long workOrderId) {
        return ResponseEntity.ok(attachmentService.upload(file, workOrderId));
    }

    @GetMapping("/work-order/{workOrderId}")
    public ResponseEntity<List<Attachment>> getByWorkOrder(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(attachmentService.getByWorkOrder(workOrderId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        attachmentService.delete(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}