package rs.ac.singidunum.basic_ticket_manager.service;

import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;
import rs.ac.singidunum.basic_ticket_manager.entity.User;
import rs.ac.singidunum.basic_ticket_manager.enums.Priority;
import rs.ac.singidunum.basic_ticket_manager.enums.Status;
import rs.ac.singidunum.basic_ticket_manager.enums.Type;
import rs.ac.singidunum.basic_ticket_manager.projection.TicketPriorityCount;
import rs.ac.singidunum.basic_ticket_manager.projection.TicketStatusCount;
import rs.ac.singidunum.basic_ticket_manager.repository.TicketRepository;
import rs.ac.singidunum.basic_ticket_manager.repository.UserRepository;

import java.time.LocalDate;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Override
    public Page<Ticket> getAllTickets(String sortBy, String order, Pageable pageable) {

        boolean desc = order.equalsIgnoreCase("desc");

        return switch (sortBy) {
            case "priority" -> desc ?
                    ticketRepository.findAllSortByPriorityDesc(pageable)
                    : ticketRepository.findAllSortByPriorityAsc(pageable);
            case "status" -> desc ?
                    ticketRepository.findAllSortByStatusDesc(pageable)
                    : ticketRepository.findAllSortByStatusAsc(pageable);
            case "type" -> desc ?
                    ticketRepository.findAllSortByTypeDesc(pageable)
                    : ticketRepository.findAllSortByTypeAsc(pageable);
            default -> ticketRepository.findAll(pageable);
        };
    }

    @Override
    public List<Ticket> getUnassignedTickets() {
        return ticketRepository.findByAssignedToIsNull();
    }

    @Override
    public List<Ticket> getTicketsByAssignedTo(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        return ticketRepository.findByAssignedTo(user);
    }

    @Override
    public Ticket getTicketById(int id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found."));
    }

    @Override
    public Page<Ticket> getTicketsByStatus(Status status, Pageable pageable) {
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be provided.");
        }
        return ticketRepository.findByStatus(status, pageable);
    }

    @Override
    public Page<Ticket> getTicketsByType(Type type, Pageable pageable) {
        if (type == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type must be provided.");
        }
        return ticketRepository.findByType(type, pageable);
    }

    @Override
    public Page<Ticket> getTicketsByPriority(Priority priority, Pageable pageable) {
        if (priority == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Priority must be provided.");
        }
        return ticketRepository.findByPriority(priority, pageable);
    }

    @Override
    public Map<Priority, Long> getTicketCountByPriority() {
        Map<Priority, Long> countMap = new EnumMap<>(Priority.class);
        List<TicketPriorityCount> count = ticketRepository.countByPriority();

        for (TicketPriorityCount tpc : count) {
            countMap.put(tpc.getPriority(), tpc.getCount());
        }

        for (Priority p : Priority.values()) {
            countMap.putIfAbsent(p, 0L);
        }

        return countMap;
    }

    @Override
    public Map<Status, Long> getTicketCountByStatus() {
        Map<Status, Long> countMap = new EnumMap<>(Status.class);
        List<TicketStatusCount> count = ticketRepository.countByStatus();

        for (TicketStatusCount tsc : count) {
            countMap.put(tsc.getStatus(), tsc.getCount());
        }

        for (Status s : Status.values()) {
            countMap.putIfAbsent(s, 0L);
        }

        return countMap;
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

        if (updatedTicket.getAssignedTo() != null) {
            int userId = updatedTicket.getAssignedTo().getUserId();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
            ticket.setAssignedTo(user);
        } else {
            ticket.setAssignedTo(null);
        }

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

    @Override
    public Map<String, Long> getAssignedAndUnassignedTicketCount() {
        long assigned = 0;
        long unassigned = 0;

        for (Ticket ticket : ticketRepository.findAll()) {
            if (ticket.getAssignedTo() != null) assigned++;
            else unassigned++;
        }

        return Map.of(
                "assigned", assigned,
                "unassigned", unassigned
        );
    }
}
