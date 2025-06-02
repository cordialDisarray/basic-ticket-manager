package rs.ac.singidunum.basic_ticket_manager.controller;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;
import rs.ac.singidunum.basic_ticket_manager.repository.TicketRepository;

import java.util.List;

@RestController
@AllArgsConstructor
public class TicketController {
    private final TicketRepository ticketRepository;


    @GetMapping("/tickets")
    public List<Ticket> getAllTickets(){
        return ticketRepository.findAll();
    }
}
