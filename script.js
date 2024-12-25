let profiles = loadProfilesFromStorage();
console.log(profiles);
$(function () {
  // ----- Initial Page (Team Members) -----
  $("#continue-to-profiles").on("click", function () {
    $(".team-members-page").addClass("hidden");
    $(".profile-page").removeClass("hidden");

    renderProfiles();
  });

  $("#new-profile-btn").on("click", function () {
    $("#add-box").removeClass("hidden");
    $("#add-box input").focus();
  });

  $("#add-profile-btn").on("click", function () {
    if ($("#add-box input").val() === "") alert("Please enter a name.");
    else profiles.push({ name: $("#add-box input").val(), initialMoney: 1000 });

    $("#add-box input").val("");
    $("#add-box").addClass("hidden");
    saveProfiles();
    renderProfiles();
  });

  renderProfiles = () => {
    $(".profile-list").empty();

    if (profiles.length === 0) {
      $(".profile-list").append(`
                <div class="profile">
                    <h3>EMPTY</h3>
                </div>
            `);
    } else {
      $(".profile-list").empty();

      for (let i = 0; i < profiles.length; i++) {
        $(".profile-list").append(`
                    <a class="user-wallet-link" href="#" data-name="${profiles[i].name}">
                    <div class="profile">
                        
                            <button class="rmv-btn">Remove</button>
                            <h3>${profiles[i].name}</h3>
                            <p>Initial Money: $${profiles[i].initialMoney}</p>
                        
                    </div>
               </a>
                `);

        localStorage.setItem("profiles", JSON.stringify(profiles));
      }
    }
  };

  $(".profile-list").on("click", ".rmv-btn", function (e) {
    let index = $(this).parent().index();
    e.stopPropagation();
    localStorage.removeItem(profiles.splice(index, 1));
    renderProfiles();
  });

  $(".profile-list").on("click", ".user-wallet-link", function (e) {
    e.preventDefault();
    const name = $(this).data("name");
    // if (name && profiles[name]) {
    currentProfile = profiles[name];
    console.log(currentProfile);
    console.log(name);
    $(".profile-page").addClass("hidden");
    $(".main-content").removeClass("hidden");
    $(".header-right").removeClass("hidden");
    $("#current-profile-name").text(name);
    // }
  });

  $(".header-right button").on("click", function () {
    $(".profile-page").removeClass("hidden");
    $(".header-right").addClass("hidden");
    $(".main-content").addClass("hidden");
  });

  //
  // DAY BUTTONS
  //
  // constants
  const END_DAY = 365;
  const START_DAY = 2;
  const YEAR_START = new Date(2021, 0, 1);
  let currentDay = START_DAY;
  // date part of the next day button
  function calculateDateFromDay(day) {
    const date = new Date(YEAR_START.getTime());
    date.setDate(date.getDate() + (day - 1)); // adjust for the given day
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  // update day and date in the UI
  function updateDayAndDateUI() {
    $("#current-day").text(currentDay);
    $("#current-date").text(calculateDateFromDay(currentDay));
  }
  // it changes to the next day until the end of the sim
  $("#next-day-btn").on("click", function () {
    if (currentDay < END_DAY) {
      currentDay++;
      updateDayAndDateUI();
    } else {
      alert("End of the simulation!");
    }
  });
  updateDayAndDateUI();

  //
  //    COIN SELECTION BUTTONS
  //
  //
});

function saveProfiles() {
  localStorage.setItem("profiles", JSON.stringify(profiles));
  console.log(profiles);
}

function loadProfilesFromStorage() {
  let data = localStorage.getItem("profiles");
  return data ? JSON.parse(data) : [];
}
