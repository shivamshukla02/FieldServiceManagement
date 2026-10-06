package com.FieldServiceManagement.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.FieldServiceManagement.domain.Attachment;
import com.FieldServiceManagement.domain.WorkOrder;
import com.FieldServiceManagement.repository.AttachmentRepository;
import com.FieldServiceManagement.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class AttachmentService {

    private final Cloudinary cloudinary;
    private final AttachmentRepository attachmentRepository;
    private final WorkOrderRepository workOrderRepository;

    public AttachmentService(Cloudinary cloudinary,
                              AttachmentRepository attachmentRepository,
                              WorkOrderRepository workOrderRepository) {
        this.cloudinary = cloudinary;
        this.attachmentRepository = attachmentRepository;
        this.workOrderRepository = workOrderRepository;
    }

    public Attachment upload(MultipartFile file, Long workOrderId) {
        validateFile(file);
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + workOrderId));
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("folder", "keystone/wo-" + workOrderId, "resource_type", "auto"));

            Attachment attachment = new Attachment();
            attachment.setFileName(file.getOriginalFilename());
            attachment.setContentType(file.getContentType());
            attachment.setSizeOfFile(file.getSize());
            attachment.setStoragePath(uploadResult.get("secure_url").toString());
            attachment.setCloudinaryId(uploadResult.get("public_id").toString());
            attachment.setWorkOrder(wo);
            return attachmentRepository.save(attachment);
        } catch (Exception e) {
            throw new RuntimeException("Cloud upload failed: " + e.getMessage());
        }
    }

    public List<Attachment> getByWorkOrder(Long workOrderId) {
        return attachmentRepository.findByWorkOrderId(workOrderId);
    }

    public void delete(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        try {
            cloudinary.uploader().destroy(attachment.getCloudinaryId(), ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete from cloud");
        }
        attachmentRepository.deleteById(id);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new RuntimeException("File cannot be empty");
        if (file.getSize() > 10 * 1024 * 1024) throw new RuntimeException("Max file size is 10MB");
        List<String> allowed = Arrays.asList("image/png", "image/jpeg", "image/jpg", "video/mp4", "application/pdf");
        if (!allowed.contains(file.getContentType())) throw new RuntimeException("Invalid file format");
    }
}