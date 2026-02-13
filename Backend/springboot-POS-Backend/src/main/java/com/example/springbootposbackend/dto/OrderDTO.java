package com.example.springbootposbackend.dto;

import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.util.List;

public class OrderDTO {
    private int orderId;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$" , message = "Date must be in the format YYYY-MM-DD") /*YYYY-MM-DD*/
    private LocalDate date;

    private String customerId;

    private List<OrderDetailDTO> orderDetails;
}
