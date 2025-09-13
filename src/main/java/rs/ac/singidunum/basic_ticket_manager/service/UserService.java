package rs.ac.singidunum.basic_ticket_manager.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import rs.ac.singidunum.basic_ticket_manager.entity.User;

public interface UserService {
    Page<User> getAllUsers(String sortBy, String order, Pageable pageable);

    User getUserById(int id);

    User createUser(User user);

    User updateUser(int id, User user);

    void deleteUser(int id);
}
