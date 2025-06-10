package rs.ac.singidunum.basic_ticket_manager.service;

import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;
import rs.ac.singidunum.basic_ticket_manager.enums.Priority;
import rs.ac.singidunum.basic_ticket_manager.enums.Status;
import rs.ac.singidunum.basic_ticket_manager.enums.Type;

import java.util.List;
import java.util.Map;

public interface TicketService {
    List<Ticket> getAllTickets(String sortBy, String order);

    List<Ticket> getAllTickets();

    List<Ticket> getUnassignedTickets();

    List<Ticket> getTicketsByAssignedTo(int userId);

    Ticket getTicketById(int id);

    Ticket createTicket(Ticket ticket);

    Ticket updateTicket(int id, Ticket ticket);

    void deleteTicket(int id);

    List<Ticket> getTicketsByStatus(Status status);

    List<Ticket> getTicketsByType(Type type);

    List<Ticket> getTicketsByPriority(Priority priority);

    Map<Priority, Long> getTicketCountByPriority();

    Map<Status, Long> getTicketCountByStatus();
}
