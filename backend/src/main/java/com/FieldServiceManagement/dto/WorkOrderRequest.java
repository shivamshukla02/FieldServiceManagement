package com.FieldServiceManagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkOrderRequest {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String priority;

    @NotNull
    private Long customerId;

    @NotNull
    private Long siteId;
}