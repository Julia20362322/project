/*
	Javascript used on different pages has been placed into 1 Javascript file to leverage caching and decrease page load times as a result of fewer HTTP requests.

	JSLint Valid according to http://jsfiddle.net/
	
    David Maza - 20773548
*/

////////////////----------------------------- AJAX -----------------------------////////////////

var ajax = {

	go: function(jsonData, callbackSuccess, callbackFailure) {
		$.ajax({
			type: "POST",
			url: "http://this-is-an-ajax-call.com",
			data: jsonData,
			dataType: "text",
			done: callbackSuccess,
			fail: callbackFailure
		});
	},
	
	add: function(action1, listID1, value1, callback1) {
		jsonData = {
			action: action1,
			listID: listID1,
			newValue: value1
		};
		debugger;
		ajax.go(jsonData, callback1, ajax.generalFailure);
	},
	
	edit: function(action1, listID1, itemID1, value1) {
		jsonData = {
			action: action1,
			listID: listID1,
			itemID: itemID1,
			newValue: value1
		};
		
		ajax.go(jsonData);
	},
	
	generalFailure: function(data, textStatus, jqXHR) {
		alert("FAILED");
	}
};

////////////////----------------------------- All pages -----------------------------////////////////

$(document).ready(function () {
    $('.slider').cycle({
        fx: 'scrollRight',
        next: '#right',
        delay: 2000,
        timeout: 5000,
        easing: 'easeInQuad'
    });

    $(".login-window").hide();

    $("#login-button").click(function () {
        if ($(".login-window:visible").length > 0) {
            $(".login-window").hide("drop", {
                direction: "up"
            }, 500);
            $("#login-arrow").removeClass("rotateArrow90");
        } else {
            $(".login-window").show("drop", {
                direction: "up"
            }, 500);
            $("#login-arrow").addClass("rotateArrow90");
        }
    });

    $(".login-button").click(function () {
        $("#login-button").trigger("click");
    });
});

////////////////----------------------------- Todo list -----------------------------////////////////

var localCounter = 0;

$(function () {
    $(".todoList").sortable({
		stop: function( event, ui ) {
			ajax.edit("./item/editPos.json", $("#currentListID").html(), ui.item.attr("itemID"), ui.item.index());	
		}
	});
    $(".todoList").disableSelection();
    $("#newItemInput").hide();



    $("#newItemButton").click(function () {
        if ($("#newItemInput:visible").length > 0) {
            ajax.add("./item/add.json", $("#currentListID"), $("#newItemInput").val(), todo.addItem);
        } else {
            // Show the input field
            $("#newItemInput").val("");
            $("#newItemInput").show();
			$("#addDeadline").show();
			
			$("#addDeadline").datepicker();
			
            $("#newItemText").html("Add");

        }
    });

    // Generate the todo list
    todo.renderToDoList();
    /*
	$("#item-delete").click(function() {
		$("#item-delete-dialog").dialog({
			resizable: true,
			height:140,
			modal: true,
			buttons: {
				"Delete": function() {
					$( this ).dialog( "close" );
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			}
		});
	});*/

});

var todo = {

	addItem: function(data, textStatus, jqXHR){
		// Add a new item
		$(".todoList").html($(".todoList").html() + '<li class="todoListRawItem" itemID=' + data + '>' + $("#newItemInput").val() + '</li>');

		$("#newItemInput").val("");
		$("#newItemInput").hide();
		$("#newItemText").html("New Item");

		todo.renderToDoList();
	},

    renderCheckbox: function (ele, i) {
        var newID = "cbx-" + i;
        ele.attr({
            "id": newID
        })
            .prop({
            "type": "checkbox"
        })
            .after($("<label />").attr({
            "for": newID
        }))
            .button({
            "text": false
        });
		
        return ele;
    },

	syncLocalStorage: function() {
		localStorage.clear();
		var i = 1;

		$(".itemDesc").each(function () {
			var completedString = $(this).parent().children("input[type='checkbox']").prop("checked") ? " (Completed)" : "";

			localStorage.setItem($("#todoListName").html() + ' - Item ' + i + completedString, $(this).text());
			
			i++;
		});
	},
	
	updateCheckbox: function(labelItem, checked) {
		if (checked) {
			labelItem.addClass("ui-state-hover");
			labelItem.addClass("ui-state-active");
			labelItem.addClass("ui-button-icon-only");
			labelItem.removeClass("ui-button-text-only");
			labelItem.html('<span class="ui-button-icon-primary ui-icon ui-icon-check"></span><span class="ui-button-text"></span>');
			labelItem.attr("aria-pressed", "true");
		} else {
			labelItem.removeClass("ui-state-hover");
			labelItem.removeClass("ui-state-active");
			labelItem.removeClass("ui-button-icon-only");
			labelItem.addClass("ui-button-text-only");
			labelItem.html('<span class="ui-button-text"></span>');
			labelItem.attr("aria-pressed", "false");
		}

	},
	
    renderToDoList: function () {

        var itemText;
		
        $(".todoListRawItem").each(function () {
            itemText = $(this).text();
			
            $(this).html('<span class="ui-icon ui-icon-grip-dotted-vertical" style="display: inline-block; vertical-align:middle"></span><input type="checkbox" class="itemStatus"><span class="itemDesc">' + itemText + '</span>');

            $(this).removeClass("todoListRawItem");

            var itemCheckbox = $(".itemStatus", this);

            var newCheckBox = todo.renderCheckbox(itemCheckbox, localCounter);

            $('.itemStatus').on("change", function () {
				var itemStatus = "";
				var rowItem = $(this).parent();
				
				todo.updateCheckbox(rowItem.children("label"), $(this).prop("checked"));

                if ($(this).prop("checked")) {
					itemStatus = "completed";
				
                    rowItem.css("text-decoration", "line-through");

                    // Before the todo list item description
					if(rowItem.children(".ui-icon-trash").length === 0) {
						rowItem.children(".itemDesc").before('<span class="ui-icon ui-icon-trash" style="display: inline-block; vertical-align: middle; margin: -5px 6px 0px -3px;"></span>');
					}

                    rowItem.children(".ui-icon-trash").click(function () {
                        $("#item-delete-dialog").dialog({
                            resizable: true,
                            modal: true,
                            buttons: {
                                "Delete": function () {
									ajax.edit("./item/delete.json", $("#currentListID").html(), rowItem.attr("itemID"), "");
								
                                    rowItem.remove();
                                    $(this).dialog("close");
                                },
                                Cancel: function () {
                                    $(this).dialog("close");
                                }
                            }
                        });
                    });

                } else {
					itemStatus = "";
					
                    rowItem.css("text-decoration", "none");
                    rowItem.children(".ui-icon-trash").remove();
                }
				
				ajax.edit("./item/markStatus.json", $("#currentListID").html(), rowItem.attr("itemID"), itemStatus);	
            });

            if ($(this).hasClass("completed")) {
                itemCheckbox.trigger("click");

                $(this).removeClass("completed");
            }
						
            localCounter++;
        });

        // If we actually rendered todo list items on this page
        if (localCounter > 0) {
            // Make all todo list items editable
            $(".todoList .itemDesc").editable(function(value, settings) {
				$(this).html(value);

				ajax.edit("./item/editDesc.json", $("#currentListID").html(), $(this).parent().attr("itemID"), value);	
			}, {
                /*indicator: "<img src='img/indicator.gif'>",*/
                tooltip: "Click to edit...",
                style: "inherit",
                submit: "Save"
            });
        }
		
		$("#todolist-edit").click(function() {
			$("#newListName").val($("#todoListName").html());
		
			// Build todolist item editor
			$("#todolist-editList-dialog").dialog({
				resizable: true,
				modal: true,
				buttons: {
					"Update": function () {
						$("#todoListName").html($("#newListName").val());
						
						ajax.edit("./list/updateName.json", $("#currentListID").html(), "", $("#newListName").val());
						ajax.edit("./list/updatePrivacy.json", $("#currentListID").html(), "", ($("#publicallyVisible").is(':checked') ? $("#publicallyVisible").val() : ""));
						
						todo.syncLocalStorage();
						
						$(this).dialog("close");
					},
					Cancel: function () {
						$(this).dialog("close");
					}
				}
			});
		});
		
		todo.syncLocalStorage();
    }

};


////////////////--------------------------- Todo List Browser ---------------------------////////////////

$(document).ready(function() {

	$("#newListInput").hide();
	$("#newListText").click(function () {
        if ($("#newListInput:visible").length > 0) {
			
			ajax.add('./list/add.json', '', $("#newListInput").val(), listBrowser.addItem) ;
            
        } else {
            // Show the input field
            $("#newListInput").val("");
            $("#newListInput").show();
            $("#newListText").html("Add");

        }
    });
	
	listBrowser.render();

});

var listBrowser = {
	addItem: function(data, textStatus, jqXHR)  {
		// Add a new item
		$("#list-of-lists").html($("#list-of-lists").html() + '<tr listID="' + data + '"><td class="listName">' + $("#newListInput").val() + '</td><td align="center"><input type="checkbox" class="publicOrNotList"/></td><td align="center"><span class="ui-icon ui-icon-pencil editList"></span></td><td align="center"><span class="ui-icon ui-icon-trash deleteList"></span></td></tr>');
		$(".todoList").html($(".todoList").html() + '<li class="todoListRawItem">' + $("#newListInput").val() + '</li>');

		$("#newListInput").val("");
		$("#newListInput").hide();
		$("#newListText").html("New List");
		
		listBrowser.render();
	},
	
	render: function() {
		$("#list-of-lists tr td").addClass("ui-widget-content");
		
		$(".publicOrNotList").click(function() {
			var publicOrNotListValue = $(this).prop("checked") ? "checked" : "";
			
			ajax.edit("./list/updatePrivacy.json", $(this).parent().parent().attr("listID"), "", publicOrNotListValue);
		});
		
		
		$(".editList").click(function() {
			var concernedRow = $(this).parent().parent();

			$("#newListName").val(concernedRow.children(".listName").html());
			$("#todolist-editName-dialog").dialog({
				resizable: true,
				modal: true,
				buttons: {
					"Update": function () {
						ajax.edit("./list/updateName.json", concernedRow.attr("listID"), "", $("#newListName").val());
						concernedRow.children(".listName").html($("#newListName").val());
						
						$(this).dialog("close");
					},
					Cancel: function () {
						$(this).dialog("close");
					}
				}
			});
		});
		
		
		
		$(".deleteList").click(function() {
			var concernedRow = $(this).parent().parent();
			
			$("#todolist-delete-dialog").dialog({
				resizable: true,
				modal: true,
				buttons: {
					"Delete": function () {
						concernedRow.remove();
						ajax.edit("./list/delete.json", concernedRow.attr("listID"), "", "");
											
						$(this).dialog("close");
					},
					Cancel: function () {
						$(this).dialog("close");
					}
				}
			});
		});
	}
};

////////////////----------------------------- Signup page -----------------------------////////////////


var failedValidation = false;
var regexEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;



function failValidation(field, errorMsg) {

    var errorMsgFormatted = "<span class='validationFailed'>" + errorMsg + "</span>";

    $("span#" + field + "_validation").html(errorMsgFormatted);

    return true;
}

$(function () {
    $(".signupForm").submit(function () {

        var failedValidation = false;

        if ($("#signup_email").val() === "") {
            failedValidation = failValidation("signup_email", "(Empty email address)");
        }
        if ($("#signup_password").val() === "") {
            failedValidation = failValidation("signup_password", "(Empty password)");
        }
        if ($("#signup_confirmPassword").val() === "") {
            failedValidation = failValidation("signup_confirmPassword", "(Empty password confirmation)");
        }

        if (failedValidation) {
            return false;
        }



        if ($("#signup_password").val() !== $("#signup_confirmPassword").val()) {
            failedValidation = failValidation("signup_confirmPassword", "(Passwords do not match)");
        }

        if (!regexEmail.test($("#signup_email").val())) {
            failedValidation = failValidation("signup_email", "(Invalid email)");
        }

        return !failedValidation;

    });

    $(".signupForm input").keypress(function () {
        $(this).parent().children("span").html(""); // Clear the validation error for that particular form item
    });
});

////////////////----------------------------- Conatct us -----------------------------////////////////

$(document).ready(function () {
    // If Google Maps is on this page
    if ($("#google-maps-location").length > 0) {
        var latlng = new google.maps.LatLng(-25.1385, 138.2429);
        var options = {
            zoom: 10,
            center: latlng,
            disableDefaultUI: true,
            navigationControl: true,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.SMALL
            },

            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },
            streetViewControl: false,
            mapTypeId: google.maps.MapTypeId.TERRAIN
        };

        var map = new google.maps.Map(document.getElementById("google-maps-location"), options);
        var marker = new google.maps.Marker({
            position: latlng,
            map: map,
            title: "Simpson Desert National Park, Birdsville, QLD, 4482"
        });
    }
});