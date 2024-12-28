let profiles = loadProfilesFromStorage();
console.log(profiles);
let currentProfile = null;
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
    else {
      profiles.push({
        name: $("#add-box input").val(),
        initialMoney: 1000,
        currentDay: 2,
        coins: {},
        selectedCoin: "BTC",
      });
      console.log("profile info" + profiles);
    }

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

  //remove profile
  $(".profile-list").on("click", ".rmv-btn", function (e) {
    let index = $(this).parent().index();
    e.stopPropagation();
    localStorage.removeItem(profiles.splice(index, 1));
    renderProfiles();
  });

  $(".profile-list").on("click", ".user-wallet-link", function (e) {
    e.preventDefault();
    const name = $(this).data("name");

    // Find the profile by name
    currentProfile = profiles.find((profile) => profile.name === name);
    coinName = coins.find(
      (coin) => coin.code === currentProfile.selectedCoin.toLowerCase()
    ).name;
    if (currentProfile) {
      console.log(currentProfile);
      //console.log(name);

      $(".profile-page").addClass("hidden");
      $(".main-content").removeClass("hidden");
      $(".header-right").removeClass("hidden");
      $("#current-profile-name").text(currentProfile.name);
      $(".bottom-section").removeClass("hidden");
      $("#initial-page").css("height", "150vh");
      $("#selected-coin-name").text(coinName);

      if (isBuy) $("#process-btn").text("Buy").append(` ${coinName}`);
      else $("#process-btn").text("Sell").append(` ${coinName}`);

      updateUI();
    } else {
      console.error("b not found!");
    }
  });

  $(".header-right button").on("click", function () {
    $(".profile-page").removeClass("hidden");
    $(".header-right").addClass("hidden");
    $(".main-content").addClass("hidden");
    $(".bottom-section").addClass("hidden");
    $("#initial-page").css("height", "100vh");
    $(".coin-option").removeClass("selected");
  });

  //
  // DAY BUTTONS
  //
  // constants
  const END_DAY = 365;
  const YEAR_START = new Date(2021, 0, 1);
  console.log(currentProfile);
  // let selectedCoin = "BTC";
  // let coinName = coins.find(coin => coin.code === currentProfile.selectedCoin.toLowerCase()).name;
  let coinName = "Bitcoin";

  $("#buy-btn").css("background", "green");
  $("#buttons").css("border-color", "green");
  $("#process-btn")
    .css("background", "green")
    .text("Buy")
    .append(` ${coinName}`);

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

  // function updateUI() {
  //   $("#current-day").text(currentProfile.currentDay);
  //   $("#current-date").text(calculateDateFromDay(currentProfile.currentDay));

  //   $(`.coin-option[data-coin="${currentProfile.selectedCoin}"]`).addClass(
  //     "selected"
  //   );
  //   // display the coin name

  //   const candleData = getCandlestickDataForCoin(
  //     currentProfile.selectedCoin,
  //     2, // how the last 2 days of data
  //     currentProfile.currentDay
  //   );
  //   renderCandlestickChart(candleData, "#candlestick-chart");
  // }

  function updateUI() {
    if (!currentProfile) return;
    $("#current-day").text(currentProfile.currentDay);
    $("#current-date").text(calculateDateFromDay(currentProfile.currentDay));
    $(`.coin-option[data-coin="${currentProfile.selectedCoin}"]`).addClass(
      "selected"
    );

    console.log(`Selected coin: ${currentProfile.selectedCoin}`);
  }

  let candleData;

  // it changes to the next day until the end of the sim
  $("#next-day-btn").on("click", function () {
    if (currentProfile.currentDay < END_DAY) {
      currentProfile.currentDay++;
      updateUI();
      candleData = getCandlestickDataForCoin(
        currentProfile.selectedCoin,
        120,
        currentProfile.currentDay
      );
      renderCandlestickChart(candleData, "#candlestick-chart");
      // // im using this instead of updateUI so it won't get affected by button changes
      // $("#current-day").text(currentProfile.currentDay);
      // $("#current-date").text(calculateDateFromDay(currentProfile.currentDay));
    } else {
      alert("End of the simulation!");
    }
  });

  var isBuy = true;

  $(".coin-option").on("click", function () {
    currentProfile.selectedCoin = $(this).data("coin");
    coinName = coins.find(
      (coin) => coin.code === currentProfile.selectedCoin.toLowerCase()
    ).name;
    //console.log(coinName);
    $(".coin-option").removeClass("selected");
    $(this).addClass("selected");

    $("#selected-coin-name").text(coinName);
    // update the new coin name
    // $("#selected-coin-name").text(coinFullName(selectedCoin));

    //console.log(`Selected coin updated to: ${selectedCoin}`);

    if (isBuy) {
      $("#process-btn").text("Buy").append(` ${coinName}`);
    } else {
      $("#process-btn").text("Sell").append(` ${coinName}`);
    }

    console.log(`Selected coin updated to: ${currentProfile.selectedCoin}`);
    // $(".coin-option").removeClass("selected");
    // put the ring selection to the new coin
    $(`.coin-option[data-coin="${currentProfile.selectedCoin}"]`).addClass(
      "selected"
    );
  });

  //
  // chartstick implementation
  //
  //

  // 1) Basic chartstick rendering function
  function renderCandlestickChart(candles, containerSelector) {
    const $chart = $(containerSelector);
    const chartEl = $chart[0];
  
    // Clear previous chart elements
    $chart.empty();
  
    // 1) Get min and max prices for scaling
    let allPrices = [];
    candles.forEach((c) => {
      allPrices.push(c.low, c.high, c.open, c.close);
    });
    let minP = Math.min(...allPrices);
    let maxP = Math.max(...allPrices);
  
    let padding = 15;
    let chartHeight = $chart.height();
  
    // 2) A price -> Y-position scaling function
    function priceToY(price) {
      let ratio = (price - minP) / (maxP - minP);
      let scaled = ratio * (chartHeight - 2 * padding);
      return chartHeight - padding - scaled;
    }
  
    // Alternate scale function
    let scale = (val) => {
      return ((val - minP) / (maxP - minP)) * (chartHeight - 20) + 10;
    };
  
    // 3) Draw each candle
    let xPos = 0; // start from left
    candles.forEach((c) => {
      let yOpen = scale(c.open);
      let yClose = scale(c.close);
      let yHigh = scale(c.high);
      let yLow = scale(c.low);
  
      // Candle color
      let color =
        c.close > c.open ? "green" : c.close < c.open ? "red" : "gray";
  
      let $candle = $("<div class='candle'></div>").data("candle", c);
  
      // "stick" = the line from low to high
      let $stick = $("<div>")
        .addClass("stick")
        .css({
          left: xPos - 2.5 + "px",
          bottom: yLow + "px",
          height: Math.abs(yLow - yHigh) + "px",
        });
  
      // "bar" = the rectangle from open to close
      let $bar = $("<div>")
        .addClass("bar")
        .css({
          background: color,
          left: xPos - 4 + "px",
          bottom: Math.min(yOpen, yClose) + "px",
          height: Math.abs(yClose - yOpen) + "px",
        });
  
      // Append to the candle container
      $candle.append($stick).append($bar);
  
      // Append the candle to the chart
      $chart.append($candle);
  
      // Increase xPos so next candle doesn't overlap
      xPos += $chart.width() / 120;
    });
  
    // 4) Draw last-close line
    let lastClose = candles[candles.length - 1].close;
    let lastCloseY = priceToY(lastClose);
    
    // Adjust the Y-coordinate if necessary
    let adjustedLastCloseY = lastCloseY; // Adjust this value as needed
    
    let $lastClose = $("<div class='last-close-line'></div>").css({
      top: adjustedLastCloseY + "px",
    });
    $chart.append($lastClose);
  

    // // 5) Tooltip logic (hover)
    // let $tooltip = $("<div class='tooltip hidden'></div>");
    // $chart.append($tooltip);

    // $chart.off("mousemove", ".stick,.bar");
    // $chart.off("mouseleave", ".stick,.bar");

    // $chart.on("mousemove", ".stick,.bar", function (e) {
    //   let cData = $(this).data("candle");
    //   if (!cData) return;

    //   $tooltip.html(`
    //     O: ${cData.open}<br/>
    //     H: ${cData.high}<br/>
    //     L: ${cData.low}<br/>
    //     C: ${cData.close}
    //   `);

    //   $tooltip.removeClass("hidden");

    //   let offset = $chart.offset();
    //   $tooltip.css({
    //     left: e.pageX - offset.left + 10 + "px",
    //     top: e.pageY - offset.top + 10 + "px",
    //   });
    // });

    // $chart.on("mouseleave", ".stick,.bar", function () {
    //   $tooltip.addClass("hidden");
    // });
  }

  function getCandlestickDataForCoin(coinCode, dayRange, currentDay) {
    // Ensure currentDay is within range
    if (currentDay < dayRange) {
      dayRange = currentDay; // Adjust to avoid fetching unavailable days
    }

    // Filter data for the specified range of days
    const filteredDays = market.slice(currentDay - dayRange, currentDay);

    // Map the data to extract candlestick information for the selected coin
    const coinData = filteredDays.map((day) => {
      const coinInfo = day.coins.find(
        (coin) => coin.code === coinCode.toLowerCase()
      );
      return {
        open: coinInfo.open,
        high: coinInfo.high,
        low: coinInfo.low,
        close: coinInfo.close,
      };
    });

    return coinData;
  }

  $(".coin-option").on("click", function () {
    currentProfile.selectedCoin = $(this).data("coin"); // Update the selected coin
    candleData = getCandlestickDataForCoin(
      currentProfile.selectedCoin,
      120,
      currentProfile.currentDay
    );
    renderCandlestickChart(candleData, "#candlestick-chart");
  });

  //updateUI();

  $("#buy-btn").on("click", function () {
    isBuy = true;
    $(this).css("background", "green");
    $("#buttons").css("border-color", "green");
    $("#sell-btn").css("background", "#fff");
    $("#process-btn")
      .css("background", "green")
      .text("Buy")
      .append(` ${coinName}`);
  });

  $("#sell-btn").on("click", function () {
    isBuy = false;
    $(this).css("background", "red");
    $("#buttons").css("border-color", "red");
    $("#buy-btn").css("background", "#fff");
    $("#process-btn")
      .css("background", "red")
      .text("Sell")
      .append(` ${coinName}`);
  });

  let timer;
  $("#play-btn").on("click", function () {
    $(this).attr("disabled", true);
    $("#stop-play-btn").attr("disabled", false);

    timer = setInterval(() => {
      if (currentProfile.currentDay < END_DAY) {
        currentProfile.currentDay++;

        candleData = getCandlestickDataForCoin(
          currentProfile.selectedCoin,
          120,
          currentProfile.currentDay
        );

        renderCandlestickChart(candleData, "#candlestick-chart");

        saveProfiles();
        updateUI();
      } else {
        clearInterval(timer);
        alert("End of the simulation!");
      }
    }, 100);
  });

  $("#stop-play-btn").on("click", function () {
    $(this).attr("disabled", true);
    $("#play-btn").attr("disabled", false);
    clearInterval(timer);
  });
});

function saveProfiles() {
  localStorage.setItem("profiles", JSON.stringify(profiles));
  console.log(profiles);
}

function loadProfilesFromStorage() {
  let data = localStorage.getItem("profiles");
  return data ? JSON.parse(data) : [];
}
