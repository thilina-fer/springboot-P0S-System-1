package com.example.springbootposbackend.dto;

import jakarta.validation.constraints.Pattern;

public class OrderDetailDTO {
    private Long itemId;

    @Pattern(regexp = "\\d+" , message = "Quantity must be a valid integer")
    private int qty;

    @Pattern(regexp = "^[-+]?[0-9]*\\.?[0-9]+$ " , message = "Quantity must be a positive number")
    private double unitPrice;
}
