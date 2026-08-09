package com.FieldServiceManagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SiteRequest {

    @NotNull
    private Long customerId;

    @NotBlank
    private String name;

    private String address;
}