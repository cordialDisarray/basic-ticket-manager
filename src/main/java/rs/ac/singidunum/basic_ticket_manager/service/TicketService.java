package rs.ac.singidunum.basic_ticket_manager.service;

import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;

import java.util.List;

public interface TicketService {
    List<Ticket> getAllTickets();

    Ticket getTicketById(int id);

    Ticket createTicket(Ticket ticket);

    Ticket updateTicket(int id, Ticket ticket);

    void deleteTicket(int id);
}
