package com.FieldServiceManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class WorkOrderResponse {
    private Long id;
    private String code;
    private String title;
    private String description;
    private String priority;
    private String status;
    private LocalDateTime slaDueAt;
    private Long customerId;
    private String customerName;
    private Long siteId;
    private String siteName;
    private Long assignedToId;
    private String assignedToName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String slaStatus;
}