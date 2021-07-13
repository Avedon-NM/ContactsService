$(document).ready(function () {

    // Initial set up
    clearAlerts();
    updatePlaceholderText();
    $('form').trigger('reset');
    checkScreenSize();
    contactsDatabase('http://localhost:8080/', null, 'GET');


    // Dynamically updates place holder text based on selected option
    $(document).on('change', '#searchOptions', function (event) {
        updatePlaceholderText();
    });


    // Update some attributes based on screen size
    function checkScreenSize() {
        var win = $(this);

        win.width() < 600 ? $('.btn_import').html("") : $('.btn_import').html(" Import");
        win.width() < 600 ? $('.btn_viewAll').html("") : $('.btn_viewAll').html(" View All");
        win.width() < 600 ? $('.btn_addNew').html("") : $('.btn_addNew').html(" Add");
        win.width() < 600 ? $('.btn_deleteAll').html("") : $('.btn_deleteAll').html(" Empty");

        win.width() <= 968 ? $('h1').fadeOut() : $('h1').fadeIn(500);
    };

    // For responsiveness
    $(window).on('resize', function () {
        checkScreenSize();
    });


    // Clears the forms when close button is clicked
    $(document).on('click', '.btn_close', function (event) {
        $('#add_error').fadeOut();
        $('form').trigger('reset');
    });


    // Resets the input data
    $(document).on('click', '.btn_clear', function (event) {
        event.preventDefault();
        $('#add_error').fadeOut();
        $('form').trigger('reset');
    });


    // Importing to the database
    $(document).on('click', '.btn_import', function (event) {
        event.preventDefault();
        clearAlerts()

        $('#info').html("Loading Contacts...");
        $('#info').fadeIn();

        let imports = [];

        let arr = [["Adam", "Johnston", "11111111112", "London Road", "Stirling", "FK7 4AP"],
        ["Bob", "Allen", "11111111113", "The Green", "Glasgow", "G12 0UT"],
        ["Maria", "Hernandez", "11111111114", "The Green", "Glasgow", "G12 0TT"],
        ["Bailey", "Gray", "11111111115", "The Grove", "Glasgow", "G11 0TT"],
        ["David", "Maria", "11111111116", "Church Road", "Edinburgh", "G11 5AA"],
        ["Mary", "Smith", "11111111117", "Church Street", "Edinburgh", "HX88 5UK"],
        ["Natalie", "Frederick", "11111111118", "London Road", "Stirling", "FK7 4AP"],
        ["Colin", "Lawrence", "11111111119", "The Avenue", "London", "SW1A 2DY"],
        ["John", "Elliott", "11111111110", "Park Avenue", "London", "SW1A 2JK"],
        ["Frederick", "Rodriguez", "11111111121", "Main Street", "Dundee", "DD1 1SA"],
        ["Terrence", "Martin", "11111111122", "Queen Street", "Aberdeen", "AB11 5EQ"],
        ["Maria", "Rodriguez", "11111111123", "The Drive", "Falkirk", "FK2 9AA"],
        ["John", "Mitchell", "11111111124", "George Street", "Falkirk", "FK2 9TB"],
        ["Zack", "Morgan", "11111111125", "Manchester Road", "Oxford", "HX88 5UK"]]

        arr.forEach(entry => {
            imports.push({ "firstName": entry[0], "lastName": entry[1], "phoneNumber": entry[2], "street": entry[3], "townCity": entry[4], "postcode": entry[5] });
        });
        contactsDatabase('http://localhost:8080/importData', imports, 'POST');
    });


    // Returns a list of all contacts
    $(document).on('click', '.btn_viewAll', function (event) {
        event.preventDefault();
        clearAlerts();

        $('#info').html("Loading contacts...");
        $('#info').fadeIn();
        setTimeout(function () { location.reload(); }, 1200);
    });

    // Empties the database
    $(document).on('click', '.btn_deleteAll', function (event) {
        event.preventDefault();
        clearAlerts();

        if (window.confirm('Are you sure?')) {
            $('#warning').html("Deleting all contacts...");
            $('#warning').fadeIn(500);
            setTimeout(function () { $('#warning').fadeOut(), contactsDatabase('http://localhost:8080/deleteAll', null, 'DELETE') }, 1200);
        }
    });


    // Returns a list of all searched contacts
    $(document).on('click', '.btn_search', function (event) {
        event.preventDefault();
        clearAlerts();

        let searchText = $('#searchText').val();
        let searchOption = $('#searchOptions').val();

        searchText == "" ? ($('#error').html("Search field is empty!"), $('#error').fadeIn(), setTimeout(function () { $('#error').fadeOut() }, 1200))
            : searchOption == "City" ? contactsDatabase(`http://localhost:8080/searchLocation/${searchText}`, null, 'GET')
                : searchOption == "Name" ? contactsDatabase(`http://localhost:8080/searchName/${searchText}`, null, 'GET')
                    : contactsDatabase(`http://localhost:8080/searchNumber/${searchText}`, null, 'GET');
        $('form').trigger('reset');
    });

    // Enables Enter to be used for submission
    $(document).on('keypress', '#searchText', function (event) {

        if (event.which === 13) {
            event.preventDefault();
            $('.btn_search').click();
        }
    });


    // Enables the selected contact to be editable
    $(document).on('click', '.btn_edit', function (event) {
        event.preventDefault();
        clearAlerts();

        // Shows hidden options
        let card = $(this).closest('div');
        card.find('.btn_save').fadeIn(500);
        card.find('.btn_cancel').fadeIn(500);
        card.find('.btn_delete').fadeIn(500);
        card.find('.btn_edit').hide();

        // Custom CSS to illustrate that data is editable
        card.find('.edit')
            .attr('contenteditable', 'true')
            .attr('edit_type', 'button')
            .css("background-color", "beige")
            .css('padding', '3px')
            .keypress(event => event.which != 13);

        // Saves the current value in a custom attribute incase the user decides to cancel
        card.find('.contact_info').each(function () {
            $(this).attr('original_value', $(this).html());
        });
    });

    // When the cancel link is clicked during editable stage
    $(document).on('click', '.btn_cancel', function (event) {
        event.preventDefault();

        let card = $(this).closest('div');

        // Hides hidden options
        card.find('.btn_save').hide();
        card.find('.btn_cancel').hide();
        card.find('.btn_delete').hide();
        card.find('.btn_edit').fadeIn(500);

        // Removes the custom CSS
        card.find('.edit')
            .attr('edit_type', 'click')
            .css("background-color", "")
            .css('padding', '');

        // Replace the original values if the user cancels editing
        card.find('.edit').each(function () {
            $(this).html($(this).attr('original_value'));
        });
    });

    // Sends the edited data to the database
    $(document).on('click', '.btn_save', function (event) {
        event.preventDefault();
        clearAlerts();

        let card = $(this).closest('div');

        card.find('.btn_save').fadeOut();
        card.find('.btn_cancel').fadeOut();
        card.find('.btn_delete').fadeOut();
        card.find('.btn_edit').fadeIn(500);

        // Removes the custom CSS
        card.find('.edit')
            .attr('edit_type', 'click')
            .css("background-color", "")
            .css('padding', '');

        let contactInfo = {};

        // Extracting contact details from the card
        card.find('.contact_info').each(function () {
            let col_name = $(this).attr('col_name');
            let col_val = $(this).html();
            contactInfo[col_name] = col_val;
        });

        contactsDatabase('http://localhost:8080/updateContact', contactInfo, 'PUT');
    });

    // Adds a new contact to the database
    $(document).on('click', '.btn_add', function (event) {
        event.preventDefault();
        clearAlerts();

        let card = $(this).closest('form');

        // If the contact info is validated, its extracted and a request is made to add them to the database
        let contactInfo = {};
        let col_name;
        let col_val;

        card.find('.add_input').each(function () {
            col_name = $(this).attr('col_name');
            col_val = $(this).val();
            contactInfo[col_name] = col_val;
        });

        contactsDatabase('http://localhost:8080/addContact', contactInfo, 'POST')
    });

    // Deletes contact from the database
    $(document).on('click', '.btn_delete', function (event) {
        event.preventDefault();
        clearAlerts();

        let phoneNumber;

        $(this).closest('div').find('.contact_info').each(function () {
            if ($(this).attr('col_name') === 'phoneNumber') (phoneNumber = $(this).html());
        });

        window.confirm('Are you sure?') ?
            contactsDatabase(`http://localhost:8080/deleteContact/${phoneNumber}`, null, 'DELETE') : $('.btn_cancel').click()
    });

    // Handles all the requests to the database
    function contactsDatabase(url, contactInfo, type) {
        $.ajax({
            url: url,
            async: false,
            type: type,
            contentType: 'application/json',
            data: JSON.stringify(contactInfo),
            success: function (response) {

                // Database either responds with a contact or message, this section handles both cases
                if (response[0].hasOwnProperty('message')) {

                    (response[0].message.includes("Success") || response[0].message.includes("imported")) ?
                        requestGranted(response, contactInfo)
                        : displayMessages(response);

                } else {
                    display(response);
                }
            },
            error: function (err) {
                $('#error').html('Error: ' + err);
            }
        })
    }

    // Displays the response contact details
    function display(contacts) {
        $("#contact_cards").empty();
        clearAlerts();

        contacts.forEach(contact => {
            $('#contact_cards').append($(`<div class="card col-7 col-xs-6 col-sm-5 col-md-4 col-lg-3 col-xl-2 m-1"> 
                        <img class="mt-3" src="/profile_icon.png" alt="Avatar" style="width:100%"> 
                        <div class="container mt-2 mb-3"> 
                        <h6><b>Name:&nbsp;</b><span class="contact_info edit" col_name="firstName">${contact.firstName}</span>&nbsp; 
                        <span class="contact_info edit" col_name="lastName">${contact.lastName}</span></h6> 
                        <h6><b>Phone:&nbsp;</b><span class="contact_info" col_name="phoneNumber">${contact.phoneNumber}</span></h6> 
                        <h6><b>Address:&nbsp;</b><span class="contact_info edit" col_name="street">${contact.street}</span></h6> 
                        <h6><span class="contact_info edit" col_name="townCity">${contact.townCity}</span></h6> 
                        <h6><b>Postcode:&nbsp;</b><span class="contact_info edit" col_name="postcode">${contact.postcode}</span></h6> 
                        <h6><b>Edited:&nbsp;</b><span>${contact.numEdits}</span> times</h6> 
                        <section class="row ml-2"><br>
                        <span class="btn_edit col"> <a href="#" class="btn-link fa fa-edit"></a> </span> 
                        <span class="btn_save col"> <a href="#" class="btn-link fa fa-save"></a></span> 
                        <span class="btn_delete col"> <a href="#" class="btn-link fa fa-trash-o"></a></span> 
                        <span class="btn_cancel col"> <a href="#" class="btn-link fa fa-times"></a></span> 
                        </section> 
                        </div> 
                        </div>`));
        });

        $(document).find('.btn_save').hide();
        $(document).find('.btn_cancel').hide();
        $(document).find('.btn_delete').hide();
    }

    // Handles successful responses' from the service
    function requestGranted(response, contactInfo) {
        clearAlerts();

        if (response[0].message.includes("Add_Response") || response[0].message.includes("Update_Response")) {

            if (response[0].message.includes("Add_Response")) $('#add_close').click();

            $('#success').html(response[0].message);
            $('#success').fadeIn(500)
            setTimeout(function () {
                contactsDatabase(`http://localhost:8080/searchNumber/${contactInfo.phoneNumber}`, null, 'GET');
            }, 1500);

        } else {
            $('#success').html(response[0].message)
            $('#success').fadeIn(500)
            setTimeout(function () { location.reload(); }, 1500);
        }
    }

    // Handles unsuccessful responses from the service, certain errors trigger specific actions
    function displayMessages(response) {
        clearAlerts();

        if (response[0].message.includes("empty")) {
            $('#warning').html(`${response[0].message}<br><br>Import Contacts or Add Contacts`);
            $('#warning').fadeIn(500);

        } else if (response[0].message.includes("Add_Error")) {
            response.forEach(log => {
                $('#add_error').append(log.message + "<br>");
            });
            $('#add_error').fadeIn(500);

        } else if (response[0].message.includes("Import")) {
            response.forEach(log => {
                $('#error').append(log.message + "<br>");
            });
            $('#error').fadeIn(500);
            $('#error').append(`<br><br><a onclick="location.reload()" class="btn-link text-secondary justify-content-end fa fa-times" href="#"></a>`);

        } else {
            response.forEach(log => {
                $('#error').append(log.message + "<br>");
            });
            $('#error').fadeIn(500);
            setTimeout(function () { location.reload(); }, 1500);
        }
    }

    // Clears the alerts so messages don't overlapse
    function clearAlerts() {
        $('#error').empty().hide();
        $('#info').empty().hide();
        $('#warning').empty().hide();
        $('#success').empty().hide();
        $('#add_error').empty().hide();
    }

    // Changes the place holder text depending on what the user wants to search by
    function updatePlaceholderText() {
        $('#searchOptions').val() == "City" ? $('#searchText').attr('placeholder', 'Search by town or city')
            : $('#searchOptions').val() == "Name" ? $('#searchText').attr('placeholder', 'Search by first or last name')
                : $('#searchText').attr('placeholder', 'Search phone number');
    };
});
