package com.example.springbootposbackend.service.impl;

import com.example.springbootposbackend.dto.OrderDTO;
import com.example.springbootposbackend.dto.OrderDetailDTO;
import com.example.springbootposbackend.entity.Customer;
import com.example.springbootposbackend.entity.Item;
import com.example.springbootposbackend.entity.Order;
import com.example.springbootposbackend.entity.OrderDetail;
import com.example.springbootposbackend.repository.CustomerRepo;
import com.example.springbootposbackend.repository.ItemRepo;
import com.example.springbootposbackend.repository.OrderDetailRepo;
import com.example.springbootposbackend.repository.OrderRepo;
import com.example.springbootposbackend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceIMPL implements OrderService {
    private final OrderRepo orderRepo;
    private final ItemRepo itemRepo;
    private final CustomerRepo customerRepo;
    private  final ModelMapper modelMapper;

    @Override
    public void placeOrder(OrderDTO orderDTO) {
        Customer customer = customerRepo.findById(Long.valueOf(orderDTO.getCustomerId()))
                .orElseThrow(() -> new RuntimeException("Customer not found: " + orderDTO.getCustomerId()));

        Order order = modelMapper.map(orderDTO, Order.class);
        order.setCustomer( customer );

        List<OrderDetail> orderDetailsList = new ArrayList<>();

        for (OrderDetailDTO orderDetailDTO : orderDTO.getOrderDetails()) {
            Item item = itemRepo.findById(orderDetailDTO.getItemId()).
                    orElseThrow(() -> new RuntimeException("Item not found: " + orderDetailDTO.getItemId()));

            if (item.getQtyOnHand() < orderDetailDTO.getQty()) {
                throw new RuntimeException("Insufficient stock for item: " + item.getId());
            }

            item.setQtyOnHand(item.getQtyOnHand() - orderDetailDTO.getQty());
            itemRepo.save(item);

            OrderDetail orderDetail = modelMapper.map(orderDetailDTO, OrderDetail.class);
            orderDetail.setItem(item);

            orderDetailsList.add(orderDetail);
        }
        order.setOrderDetails(orderDetailsList);
        orderRepo.save(order);
    }
}
