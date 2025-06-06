package rs.ac.singidunum.basic_ticket_manager.service;

import lombok.AllArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;
import rs.ac.singidunum.basic_ticket_manager.entity.User;
import rs.ac.singidunum.basic_ticket_manager.repository.TicketRepository;
import rs.ac.singidunum.basic_ticket_manager.repository.UserRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    @Override
    public List<User> getAllUsers(Sort sort) {
        return userRepository.findAll(sort);
    }

    @Override
    public User getUserById(int id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User updateUser(int id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        user.setEmail(updatedUser.getEmail());
        user.setPosition(updatedUser.getPosition());
        user.setFullName(updatedUser.getFullName());

        return userRepository.save(user);
    }

    @Override
    public void deleteUser(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        List<Ticket> assignedTickets = ticketRepository.findByAssignedTo(user);
        for (Ticket ticket : assignedTickets) {
            ticket.setAssignedTo(null);
        }

        ticketRepository.saveAll(assignedTickets);
        userRepository.delete(user);
    }
}
