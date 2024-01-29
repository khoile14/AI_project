var $messages = $(".messages-content"),
  i = 0;

$(window).load(function () {
  $messages.mCustomScrollbar();
  setTimeout(function () {
    showInitialMessage();
  }, 100);
});

function updateScrollbar() {
  $messages.mCustomScrollbar("update").mCustomScrollbar("scrollTo", "bottom", {
    scrollInertia: 10,
    timeout: 0,
  });
}

function showInitialMessage() {
  var initialMessage = "Hello, how are you? What do you want to talk about?";
  $('<div class="message new">' + initialMessage + "</div>")
    .appendTo($(".mCSB_container"))
    .addClass("new");
  updateScrollbar();
}

function insertMessage() {
  msg = $(".message-input").val();
  if ($.trim(msg) == "") {
    return false;
  }
  var selectedModel = localStorage.getItem("selectedModel") || "a";
  $('<div class="message message-personal">' + msg + "</div>")
    .appendTo($(".mCSB_container"))
    .addClass("new");
  $(".message-input").val(null);
  updateScrollbar();
  sendMessageToServer(msg, selectedModel);
}

$(".message-submit").click(function () {
  insertMessage();
});

$(window).on("keydown", function (e) {
  if (e.which == 13) {
    insertMessage();
    return false;
  }
});

function showRealMessage(responseData) {
  $('<div class="message new">' + responseData.answer + "</div>")
    .appendTo($(".mCSB_container"))
    .addClass("new");
  updateScrollbar();
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      let cookie = jQuery.trim(cookies[i]);
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

let csrftoken = getCookie("csrftoken");

function sendMessageToServer(userInput, selectedModel) {
  $.ajax({
    url: "/get_response",
    type: "POST",
    beforeSend: function (xhr) {
      xhr.setRequestHeader("X-CSRFToken", csrftoken);
    },
    // Send data as form-encoded
    data: { user_input: userInput, mdls: selectedModel },
    success: function (data) {
      showRealMessage(data);
    },
  });
}

$(document).ready(function () {
  // Retrieve the selected model from local storage
  var selectedModel = localStorage.getItem("selectedModel") || "a";
  $("#mdls").val(selectedModel);

  $("#model-form").on("submit", function (event) {
    event.preventDefault(); // Prevent the form from being submitted normally

    selectedModel = $("#mdls").val();

    var $submitButton = $("#model-form button");
    $submitButton.addClass("loading");

    $.ajax({
      url: "/get_response",
      type: "POST",
      beforeSend: function (xhr, settings) {
        // Include the CSRF token in the request header
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
      },
      data: {
        mdls: selectedModel,
      },
      success: function () {
        // Save the selected model to local storage
        localStorage.setItem("selectedModel", selectedModel);
        location.reload(); // Reload the page after successfully changing the model
      },
      error: function (xhr, status, error) {
        console.error(xhr.responseText);
      },
      complete: function () {
        $submitButton.removeClass("loading");
      },
    });
  });

  $(".message-submit").click(function () {
    insertMessage();
  });

  $(window).on("keydown", function (e) {
    if (e.which == 13) {
      insertMessage();
      return false;
    }
  });
});

$("#clear-messages").click(function () {
  $(".message:not(:first)").remove();
});
