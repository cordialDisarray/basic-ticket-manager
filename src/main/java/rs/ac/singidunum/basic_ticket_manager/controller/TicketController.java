package rs.ac.singidunum.basic_ticket_manager.controller;

import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;
import rs.ac.singidunum.basic_ticket_manager.enums.Priority;
import rs.ac.singidunum.basic_ticket_manager.enums.Status;
import rs.ac.singidunum.basic_ticket_manager.enums.Type;
import rs.ac.singidunum.basic_ticket_manager.service.TicketService;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@AllArgsConstructor
@RequestMapping("/api/tickets")
public class TicketController {
    private final TicketService ticketService;

    @GetMapping
    public Page<Ticket> getAllTickets(
            @RequestParam(required = false, defaultValue = "") String sortBy,
            @RequestParam(required = false, defaultValue = "") String order,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        if (!Set.of("assignedTo", "title", "status", "type", "priority", "createdAt", "deadline").contains(sortBy))
            sortBy = "ticketId";

        Sort.Direction direction = order.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return ticketService.getAllTickets(sortBy, order, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable int id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/filter")
    public Page<Ticket> filterTickets(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Type type,
            @RequestParam(required = false) Priority priority,
            Pageable pageable) {

        if (status != null) {
            return ticketService.getTicketsByStatus(status, pageable);
        } else if (type != null) {
            return ticketService.getTicketsByType(type, pageable);
        } else if (priority != null) {
            return ticketService.getTicketsByPriority(priority, pageable);
        } 

        return ticketService.getAllTickets("ticketId", "asc", pageable);
    }

    @GetMapping("/filter/unassigned")
    public List<Ticket> getUnassignedTickets() {
        return ticketService.getUnassignedTickets();
    }

    @GetMapping("/filter/assigned")
    public List<Ticket> getTicketsByAssignedTo(@RequestParam int userId) {
        return ticketService.getTicketsByAssignedTo(userId);
    }

    @GetMapping("/count/priority")
    public Map<Priority, Long> getTicketPriorityCount() {
        return ticketService.getTicketCountByPriority(); }

    @GetMapping("/count/status")
    public Map<Status, Long> getTicketStatusCount() {
        return ticketService.getTicketCountByStatus();
    }

    @GetMapping("/count/assignment")
    public Map<String, Long> getAssignedAndUnassignedCount(){
        return ticketService.getAssignedAndUnassignedTicketCount();
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Ticket ticket) {
        Ticket createdTicket = ticketService.createTicket(ticket);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdTicket.getTicketId())
                .toUri();

        return ResponseEntity.created(location).body(createdTicket);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable int id, @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable int id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

}
