package rs.ac.singidunum.basic_ticket_manager.service;

import lombok.AllArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;
import rs.ac.singidunum.basic_ticket_manager.repository.TicketRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@AllArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;

    @Override
    public List<Ticket> getAllTickets(String sortBy, String order) {

        return switch (sortBy) {
            case "priority" -> ticketRepository.findAllSortByPriority(order);
            case "status" -> ticketRepository.findAllSortByStatus(order);
            case "type" -> ticketRepository.findAllSortByType(order);
            case "title", "createdAt", "deadline" -> {
                Sort.Direction direction = order.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
                yield ticketRepository.findAll(Sort.by(direction, sortBy));
            }
            default -> ticketRepository.findAll();
        };
    }

    @Override
    public Ticket getTicketById(int id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found."));
    }

    @Override
    public Ticket createTicket(Ticket ticket) {
        ticket.setCreatedAt(LocalDate.now());
        return ticketRepository.save(ticket);
    }

    @Override
    public Ticket updateTicket(int id, Ticket updatedTicket) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found."));

        ticket.setAssignedTo(updatedTicket.getAssignedTo());
        ticket.setDeadline(updatedTicket.getDeadline());
        ticket.setStatus(updatedTicket.getStatus());
        ticket.setType(updatedTicket.getType());
        ticket.setPriority(updatedTicket.getPriority());
        ticket.setTitle(updatedTicket.getTitle());

        return ticketRepository.save(ticket);
    }

    @Override
    public void deleteTicket(int id) {
        ticketRepository.deleteById(id);
    }
}
