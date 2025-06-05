package rs.ac.singidunum.basic_ticket_manager.service;

import org.springframework.data.domain.Sort;
import rs.ac.singidunum.basic_ticket_manager.entity.User;

import java.util.List;

public interface UserService {
    List<User> getAllUsers(Sort sort);

    User getUserById(int id);

    User createUser(User user);

    User updateUser(int id, User user);

    void deleteUser(int id);
}
