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

    if (currentProfile) {
      console.log(currentProfile);
      //console.log(name);

      $(".profile-page").addClass("hidden");
      $(".main-content").removeClass("hidden");
      $(".header-right").removeClass("hidden");
      $("#current-profile-name").text(currentProfile.name);
      updateUI();
    } else {
      console.error("Profile not found!");
    }
  });

  $(".header-right button").on("click", function () {
    $(".profile-page").removeClass("hidden");
    $(".header-right").addClass("hidden");
    $(".main-content").addClass("hidden");
    $(".coin-option").removeClass("selected");
  });

  //
  // DAY BUTTONS
  //
  // constants
  const END_DAY = 365;
  const YEAR_START = new Date(2021, 0, 1);
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
  function updateUI() {
    $("#current-day").text(currentProfile.currentDay);
    $("#current-date").text(calculateDateFromDay(currentProfile.currentDay));

    $(`.coin-option[data-coin="${currentProfile.selectedCoin}"]`).addClass(
      "selected"
    );
    // display the coin name
    $("#selected-coin-name").text(coinFullName(currentProfile.selectedCoin));
  }

  // it changes to the next day until the end of the sim
  $("#next-day-btn").on("click", function () {
    if (currentProfile.currentDay < END_DAY) {
      currentProfile.currentDay++;
      // updateUI();
      // im using this instead of updateUI so it won't get affected by button changes
      $("#current-day").text(currentProfile.currentDay);
      $("#current-date").text(calculateDateFromDay(currentProfile.currentDay));
    } else {
      alert("End of the simulation!");
    }
  });

  //
  //    COIN SELECTION BUTTONS
  //
  //
  function coinFullName(coin) {
    switch (coin) {
      case "BTC":
        return "Bitcoin";
      case "ETH":
        return "Ethereum";
      case "ADA":
        return "Cardano";
      case "XRP":
        return "Ripple";
      case "DOGE":
        return "Dogecoin";
      case "AVAX":
        return "Avalanche";
      case "TRX":
        return "Tron";
      case "SNX":
        return "Synthetix";
      case "POL":
        return "Polygon";
      default:
        return coin;
    }
  }

  $(".coin-option").on("click", function () {
    currentProfile.selectedCoin = $(this).data("coin");
    $(".coin-option").removeClass("selected");

    // update the new coin name
    $("#selected-coin-name").text(coinFullName(currentProfile.selectedCoin));

    console.log(`Selected coin updated to: ${currentProfile.selectedCoin}`);
    // $(".coin-option").removeClass("selected");
    // buraya currentProfile.selectedCoin gelmesi lazım
    // put the ring selection to the new coin
    $(`.coin-option[data-coin="${currentProfile.selectedCoin}"]`).addClass(
      "selected"
    );
    // display the coin name
    $("#selected-coin-name").text(coinFullName(currentProfile.selectedCoin));
  });

  //
  // chartstick implementation
  //
  //
  // 1) Basic chartstick rendering function
  function renderCandlestickChart(candles, containerSelector) {
    // candles = [ { open, high, low, close }, { ... }, ... ]
    // containerSelector = e.g. "#candlestick-chart"

    const $chart = $(containerSelector);
    const chartEl = $chart[0];

    // Clear old bars (if any)
    $chart.empty();

    if (!candles || candles.length === 0) return; // no data, exit

    // 2) Find min and max among O/H/L/C
    let allPrices = [];
    candles.forEach((c) => {
      allPrices.push(c.low, c.high, c.open, c.close);
    });
    let minP = Math.min(...allPrices);
    let maxP = Math.max(...allPrices);

    let padding = 10;
    let chartHeight = $chart.height();

    // Convert a price to a Y-position in the chart
    function priceToY(price) {
      let ratio = (price - minP) / (maxP - minP);
      let scaled = ratio * (chartHeight - 2 * padding);
      let y = chartHeight - padding - scaled;
      return y;
    }

    // 3) Draw each candle
    let xPos = 0; // start from left
    candles.forEach((c) => {
      let o = c.open,
        h = c.high,
        l = c.low,
        close = c.close;

      let yOpen = priceToY(o);
      let yClose = priceToY(close);
      let yHigh = priceToY(h);
      let yLow = priceToY(l);

      // Candle color: green if close>open, red if close<open, gray if equal
      let color = close > o ? "green" : close < o ? "red" : "gray";

      // "stick" = the line from low to high
      let stick = document.createElement("div");
      stick.className = "stick";
      stick.style.left = xPos + "px";
      stick.style.bottom = yLow + "px";
      stick.style.height = yHigh - yLow + "px";

      // "bar" = the rectangle from open to close
      let bar = document.createElement("div");
      bar.className = "bar";
      bar.style.background = color;
      bar.style.left = xPos - 5 + "px"; // offset to center around xPos
      bar.style.bottom = Math.min(yOpen, yClose) + "px";
      bar.style.height = Math.abs(yClose - yOpen) + "px";

      // Append to chart
      chartEl.appendChild(stick);
      chartEl.appendChild(bar);

      // For tooltips
      $(bar).data("candle", c);
      $(stick).data("candle", c);

      // Move xPos for next candle
      xPos += 20;
    });

    // 4) Last close line
    let lastCandle = candles[candles.length - 1];
    let lastCloseY = priceToY(lastCandle.close);
    let $lastClose = $("<div class='last-close-line'></div>");
    $lastClose.css({ top: lastCloseY + "px" });
    $lastClose.text(lastCandle.close.toFixed(2));
    $chart.append($lastClose);

    // 5) Tooltip logic (hover)
    let $tooltip = $("<div class='tooltip hidden'></div>");
    $chart.append($tooltip);

    $chart.off("mousemove", ".stick,.bar");
    $chart.off("mouseleave", ".stick,.bar");

    $chart.on("mousemove", ".stick,.bar", function (e) {
      let cData = $(this).data("candle");
      if (!cData) return;

      $tooltip.html(`
        O: ${cData.open}<br/>
        H: ${cData.high}<br/>
        L: ${cData.low}<br/>
        C: ${cData.close}
      `);

      $tooltip.removeClass("hidden");

      let offset = $chart.offset();
      $tooltip.css({
        left: e.pageX - offset.left + 10 + "px",
        top: e.pageY - offset.top + 10 + "px",
      });
    });

    $chart.on("mouseleave", ".stick,.bar", function () {
      $tooltip.addClass("hidden");
    });
  }

  let twoDaysData = [
    {
      open: 28951.7,
      high: 29627.1,
      low: 28712.4,
      close: 29359.9,
    },
    {
      open: 29359.7,
      high: 33233.5,
      low: 29008.0,
      close: 32193.3,
    },
  ];

  // Immediately render just those 2 candlesticks
  renderCandlestickChart(twoDaysData, "#candlestick-chart");

  updateUI();
});

function saveProfiles() {
  localStorage.setItem("profiles", JSON.stringify(profiles));
  console.log(profiles);
}

function loadProfilesFromStorage() {
  let data = localStorage.getItem("profiles");
  return data ? JSON.parse(data) : [];
}
