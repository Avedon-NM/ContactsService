package com.contactService.contact;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ContactsService {

    @Autowired
    public ContactsRepository repository;

    // Returns the full contacts list else an an empty object containing a message
    public List<HashMap<String, String>> getAll() {
        List<HashMap<String, String>> response = new ArrayList<>();

        if (repository.findAll().isEmpty()) {
            response.add(createMessage("Database empty!"));
            return sort(response);
        }

        for (Contact contact : repository.findAll())
            response.add(splitNames(contact));

        return sort(response);
    }

    // Validates a list of contacts before adding them to the database
    public List<HashMap<String, String>> importData(List<HashMap<String, String>> imports) {
        List<HashMap<String, String>> response = new ArrayList<>();
        int counter = 0;

        for (HashMap<String, String> contactInfo : imports) {

            //If some values are missing the other conditions are automatically skipped
            if (!isValid(contactInfo)) response.add(createMessage("Import_Error: Contact missing some values!"));

            else {

                // Checks multiple conditions and only adds the contact if no messages have been added
                Contact contact = createContact(contactInfo);
                HashMap<String, String> message = new HashMap<>();

                if (repository.existsById(contact.getPhoneNumber())) {
                    message.put("message", "Import_Error: " + contact.getName() + ", " + contact.getPhoneNumber() + " already exists!");
                    response.add(message);
                }

                if (!correctPhoneFormat(contact.getPhoneNumber())) {
                    message.put("message", "Import_Error: " + contact.getPhoneNumber() + " is not a valid phone number!");
                    response.add(message);
                }
                
                if (!correctPostCodeFormat(contact.getPostcode())) {
                	message.put("message", "Import_Error: " + contact.getPostcode() + " is not a valid postcode!");
                    response.add(message);
                }
                
                if (message.isEmpty()) {
                    counter++;
                    repository.save(contact);
                }
            }
        }

        response.add(createMessage("Import_Results: " + counter + " names imported!"));

        return response;
    }

    // Searches by phone number.
    public List<HashMap<String, String>> searchNumber(String phoneNumber) {
        List<HashMap<String, String>> response = new ArrayList<>();

        repository.findByPhoneNumberContaining(phoneNumber).forEach(contact -> {
            response.add(splitNames(contact));
        });

        if (response.isEmpty()) {
            response.add(createMessage("Search_Error: Contact not found!"));
            return response;
        }

        return sort(response);
    }

    // Searches either first or last name matches
    public List<HashMap<String, String>> searchName(String name) {
        List<HashMap<String, String>> response = new ArrayList<>();

        repository.findByNameContainingIgnoreCase(name).forEach(contact -> {
            response.add(splitNames(contact));
        });

        if (response.isEmpty()) {
            response.add(createMessage("Search_Error: Contact not found!"));
            return response;
        }

        return sort(response);
    }

    // Searches by location
    public List<HashMap<String, String>> searchLocation(String cityTown) {
        List<HashMap<String, String>> response = new ArrayList();
        repository.findByTownCityContainingIgnoreCase(cityTown).forEach(contact -> {
            response.add(splitNames(contact));
        });

        if (response.isEmpty()) {
            response.add(createMessage("Search_Error: Contact not found!"));
            return response;
        }

        return sort(response);
    }


    // Validates contact details before updating
    public List<HashMap<String, String>> updateContact(HashMap<String, String> contactInfo) {
        List<HashMap<String, String>> response = new ArrayList<>();

        if (!isValid(contactInfo))
            response.add(createMessage("Update_Error: Contact missing some values!"));


        Contact contact = createContact(contactInfo);

        if (!repository.existsById(contact.getPhoneNumber()))
            response.add(createMessage("Update_Error: Contact doesn't exist!"));


        if (!correctPhoneFormat(contact.getPhoneNumber()))
            response.add(createMessage("Update_Error: Number is invalid!"));
        
        if (!correctPostCodeFormat(contact.getPostcode()))
            response.add(createMessage("Update_Error: Postcode is invalid!"));


        if (response.isEmpty()) {
            int numEdits = repository.findByPhoneNumber(contact.getPhoneNumber()).getNumEdits();
            contact.setNumEdits(numEdits + 1);
            repository.save(contact);
            response.add(createMessage("Update_Response: Success!"));
        }
        return response;
    }

    // Deletes contacts if they exists
    public List<HashMap<String, String>> deleteContact(String phoneNumber) {
        List<HashMap<String, String>> response = new ArrayList<>();

        if (!repository.existsById(phoneNumber)) {
            response.add(createMessage("Delete_Error: Contact doesn't exists!"));
            return response;
        }

        repository.deleteById(phoneNumber);
        response.add(createMessage("Delete_Response: Success!"));
        return response;
    }

    // Adds contact if one doesn't exist and also if the number is valid
    public List<HashMap<String, String>> addContact(HashMap<String, String> contactInfo) {
        List<HashMap<String, String>> response = new ArrayList<>();

        if (!isValid(contactInfo)) {
            response.add(createMessage("Add_Error: Contact missing some values!"));
            return response;
        }

        Contact contact = createContact(contactInfo);
        if (repository.existsById(contact.getPhoneNumber()))
            response.add(createMessage("Add_Error: Contact already exists!"));

        if (!correctPhoneFormat(contact.getPhoneNumber()))
            response.add(createMessage("Add_Error: Number is invalid!"));
        
        if (!correctPostCodeFormat(contact.getPostcode()))
            response.add(createMessage("Add_Error: Postcode is invalid!"));

        if (response.isEmpty()) {
            repository.save(contact);
            response.add(createMessage("Add_Response: Success!"));
        }

        return response;
    }

    // Deletes all contacts in database
    public List<HashMap<String, String>> deleteAll() {
        List<HashMap<String, String>> response = new ArrayList<>();

        if (repository.findAll().isEmpty()) {
            response.add(createMessage("Delete_Error: Database already empty!"));
            return response;
        }
        repository.deleteAll();
        response.add(createMessage("Deleted_Response: Success!"));
        return response;
    }

    // Checks that the contact provided contain the required information
    public boolean isValid(HashMap<String, String> request) {

        return (!request.containsKey("firstName") || !request.containsKey("lastName") || !request.containsKey("phoneNumber") || !request.containsKey("street") ||
                !request.containsKey("townCity") || !request.containsKey("postcode")) ? false
                : (request.get("firstName").isEmpty() || request.get("lastName").isEmpty()
                || request.get("street").isEmpty() || request.get("townCity").isEmpty() || request.get("postcode").isEmpty()) ? false
                : true;

    }
    
    // Checks the postcode has the correct format
    public boolean correctPostCodeFormat(String postcode) {
    	String postcodeFormat = "^[A-Z]{1,2}[0-9R][0-9A-Z]? [0-9][ABD-HJLNP-UW-Z]{2}$";
    	 
    	Pattern pattern = Pattern.compile(postcodeFormat);
    	Matcher matcher = pattern.matcher(postcode);
    	
    	return matcher.matches();
    }


    // Checks that the phone number is 11 digits and is a number
    public boolean correctPhoneFormat(String number) {

        for (char n : number.toCharArray()) {
            if (!Character.isDigit(n)) return false;
        }

        return (number.isEmpty() || (number.length() != 11)) ? false
                : true;
    }

    // Splits the name attribute into two ( firstName and lastName )
    public HashMap<String, String> splitNames(Contact match) {
        HashMap<String, String> contact = new HashMap<>();

        String firstName = match.getName().split("\\s+")[0];
        String lastName = (match.getName().split("\\s+").length > 1) ?
                match.getName().split("\\s+")[1]
                : "Undefined";

        contact.put("firstName", firstName);
        contact.put("lastName", lastName);
        contact.put("townCity", match.getTownCity());
        contact.put("street", match.getStreet());
        contact.put("phoneNumber", match.getPhoneNumber());
        contact.put("postcode", match.getPostcode());
        contact.put("numEdits", Integer.toString(match.getNumEdits()));

        return contact;
    }

    // Creates a new contact from the information provided
    public Contact createContact(HashMap<String, String> request) {
        Contact contact = new Contact(
                request.get("firstName") + " " + request.get("lastName"),
                request.get("phoneNumber"), 
                request.get("street"), 
                request.get("townCity"), 
                request.get("postcode").toUpperCase());

        return contact;
    }

    // Maps a string so it can be viewed in JSON format
    public HashMap<String, String> createMessage(String message) {
        HashMap<String, String> mappedMessage = new HashMap<>();
        mappedMessage.put("message", message);

        return mappedMessage;
    }

    // Sorts the contacts by first name
    public List<HashMap<String, String>> sort(List<HashMap<String, String>> response) {
        response.sort(Comparator.comparing(contact -> contact.get("firstName"),
                Comparator.nullsLast(Comparator.naturalOrder())));

        return response;
    }
}