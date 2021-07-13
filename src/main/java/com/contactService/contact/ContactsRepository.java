package com.contactService.contact;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;


public interface ContactsRepository extends MongoRepository<Contact, String> {

    List<Contact> findByNameContainingIgnoreCase(String name);

    List<Contact> findByTownCityContainingIgnoreCase(String townCity);

    List<Contact> findByPhoneNumberContaining(String phoneNumber);

    Contact findByPhoneNumber(String phoneNumber);

}
