package rs.ac.singidunum.basic_ticket_manager.service;

import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;
import rs.ac.singidunum.basic_ticket_manager.enums.Priority;
import rs.ac.singidunum.basic_ticket_manager.enums.Status;
import rs.ac.singidunum.basic_ticket_manager.enums.Type;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TicketService {
    Page<Ticket> getAllTickets(String sortBy, String order, Pageable pageable);

    List<Ticket> getUnassignedTickets();

    List<Ticket> getTicketsByAssignedTo(int userId);

    Ticket getTicketById(int id);

    Ticket createTicket(Ticket ticket);

    Ticket updateTicket(int id, Ticket ticket);

    void deleteTicket(int id);

    Page<Ticket> getTicketsByStatus(Status status, Pageable pageable);

    Page<Ticket> getTicketsByType(Type type, Pageable pageable);

    Page<Ticket> getTicketsByPriority(Priority priority, Pageable pageable);

    Map<Priority, Long> getTicketCountByPriority();

    Map<Status, Long> getTicketCountByStatus();

    Map<String, Long> getAssignedAndUnassignedTicketCount();
}
