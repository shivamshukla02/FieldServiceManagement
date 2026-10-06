package com.FieldServiceManagement.repository;

import com.FieldServiceManagement.domain.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByWorkOrderId(Long workOrderId);
}