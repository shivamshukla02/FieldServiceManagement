package com.FieldServiceManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class StatusHistoryResponse {
    private String fromStatus;
    private String toStatus;
    private String changedByName;
    private LocalDateTime changedAt;
    private String note;
}