let profiles = loadProfilesFromStorage();
console.log(profiles);
let currentProfile = null;
 // constants
 const END_DAY = 365;
 const YEAR_START = new Date(2021, 0, 1);

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
        cash: 1000,

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

      $("#total-value").removeClass("hidden");
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
    clearInterval(timer);
  });

  //
  // DAY BUTTONS
  //
 
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
      // im using this instead of updateUI so it won't get affected by button changes
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
    $("#amount").val("");
    $("#amount-value").html(`= $`);
    $(this).addClass("selected");

    $("#selected-coin-name").text(coinName);
    // update the new coin name

    //console.log(`Selected coin updated to: ${selectedCoin}`);

    if (isBuy) {
      $("#process-btn").text("Buy").append(` ${coinName}`);
    } else {
      $("#process-btn").text("Sell").append(` ${coinName}`);
    }

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


  function renderCandlestickChart(candles, containerSelector) {
    const $chart = $(containerSelector);
    const chartEl = $chart[0];
  
    //clear previous chart elements
    $chart.empty();
  

    let allPrices = [];
    candles.forEach((c) => {
      allPrices.push(c.low, c.high, c.open, c.close);
    });
    let minP = Math.min(...allPrices);
    let maxP = Math.max(...allPrices);
  
    let padding = 15;
    let chartHeight = $chart.height();
  
    function priceToY(price) {
      let ratio = (price - minP) / (maxP - minP);
      let scaled = ratio * (chartHeight - 2 * padding);
      return chartHeight - padding - scaled;
    }
  
    // alternate scale function
    let scale = (val) => {
      return ((val - minP) / (maxP - minP)) * (chartHeight - 20) + 10;
    };
  
    let xPos = 5; 
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
        })

        .data("candle", c);
  
      // "bar" = the rectangle from open to close
      let $bar = $("<div>")
        .addClass("bar")
        .css({
          background: color,
          left: xPos - 4 + "px",
          bottom: Math.min(yOpen, yClose) + "px",
          height: Math.abs(yClose - yOpen) + "px",
        })

        .data("candle", c);
  

      $candle.append($stick).append($bar);
  

      $chart.append($candle);
  
      // increase xPos so next candle doesn't overlap
      xPos += $chart.width() / 120;
    });
  

    let lastClose = candles[candles.length - 1].close;
    let lastCloseY = priceToY(lastClose);
    

    let adjustedLastCloseY = lastCloseY; 
    
    let $lastClose = $("<div class='last-close-line'></div>").css({
      top: adjustedLastCloseY + "px",
    });
    $chart.append($lastClose);

    // 5) Tooltip logic (hover)
    let $tooltip = $("<div class='tooltip hidden'></div>");
    $chart.append($tooltip);
    
    $chart.off("mousemove mouseleave", ".stick, .bar");
    $chart.on("mousemove", ".stick, .bar", function (e) {
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

  function getCandlestickDataForCoin(coinCode, dayRange, currentDay) {

    if (currentDay < dayRange) {
      dayRange = currentDay; 
    }


    const filteredDays = market.slice(currentDay - dayRange, currentDay);


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
    currentProfile.selectedCoin = $(this).data("coin"); //update the selected coin
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

  $("#process-btn").on("click", function () {
    if (isBuy) {
      buyCoins();
    } else {
      sellCoins();
    }

    $("#amount").val("");
    $("#amount-value").html(`= $`);

  });
      
});

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
  if (!currentProfile) return;
  $("#current-day").text(currentProfile.currentDay);
  $("#current-date").text(calculateDateFromDay(currentProfile.currentDay));
  $(`.coin-option[data-coin="${currentProfile.selectedCoin}"]`).addClass(
    "selected"
  );

  updateWalletDisplay();
  $(".dolar").html(`
    
    <td>Dollar</td>
    
    <td><b>${currentProfile.cash}</b></td>
    
    <td></td>
    <td></td>
    `
)

  console.log(`Selected coin: ${currentProfile.selectedCoin}`);
}

function buyCoins() {
  let coinAmount = parseFloat($("#amount").val());
  if (isNaN(coinAmount) || coinAmount <= 0) {
    alert("Enter a valid amount of coins");
    return;
  }
  let coin = currentProfile.selectedCoin;
  let marketData = market[currentProfile.currentDay];
  let coinData = marketData.coins.find(c => c.code === coin.toLowerCase());
  
  console.log(coinData.close);

  if (!coinData) return;
  let price = coinData.close;
  let cost = coinAmount * price;
  if (cost <= currentProfile.cash) {
    currentProfile.cash -= cost;
    currentProfile.coins[coin] = (currentProfile.coins[coin] || 0) + coinAmount;
    updateUI();
    saveProfiles();
    updateWalletDisplay();
  } else {
    alert("Not enough cash to buy");
  }
}

function sellCoins() {
  let coinAmount = parseFloat($("#amount").val());
  if (isNaN(coinAmount) || coinAmount <= 0) {
    alert("Enter a valid amount of coins");
    return;
  }
  let coin = currentProfile.selectedCoin;
  let marketData = market[currentProfile.currentDay];
  let coinData = marketData.coins.find(c => c.code === coin.toLowerCase());

  let price = coinData.close;
  let revenue = coinAmount * price;
  let hodl = currentProfile.coins[coin] || 0;
  if (coinAmount <= hodl) {
    currentProfile.cash += revenue;
    currentProfile.coins[coin] = hodl - coinAmount;
    updateUI();
    saveProfiles();
    updateWalletDisplay();
  } else {
    alert("Not enough coins to sell");
  }
}

let out = "";
function updateWalletDisplay() {
  out = "";
  let totalValue = currentProfile.cash;
  let coin = currentProfile.selectedCoin;
  $("#wallet-coins").empty();
  $(".dolar").empty();
 
  
  $(".dolar").html(`
    
    <td>Dollar</td>
    
    <td><b>${currentProfile.cash}</b></td>
    
    <td></td>
    <td></td>
    `
)

  for (let c in currentProfile.coins) {
    let amount = currentProfile.coins[c];
    if (amount > 0) {
  
    let marketData = market[currentProfile.currentDay];
    let coinData = marketData.coins.find(coin => coin.code === c.toLowerCase());
    
    let val = coinData.close * amount;
    totalValue += val;
    
    let coinImage = coins.find(coin => coin.code === c.toLowerCase()).image;
    let coinName = coins.find(coin => coin.code === c.toLowerCase()).name;
    
    
    // $("#amount-value").empty();

    $("#amount").on("change", function () {
      let c = market[currentProfile.currentDay].coins.find(coin => coin.code === currentProfile.selectedCoin.toLowerCase());
      console.log(coinData)
      $("#amount-value").html(`= $${$("#amount").val() * c.close}`);
    });

  
    out+= ` <tr>
    <td class='coin-in-wallet'><img src = "./images/${coinImage}">${coinName} </td>
     

    
    <td>${amount}</td>
    

   
    <td>${val}</td>
    

    
     <td>${coinData.close}</td>
     
     </tr>
`
 
    }
    $("#total-value").text("$" + totalValue.toFixed(2));
  }
  $("#wallet-coins").html(out);
  //$("#wallet-coins").append(out);
  // $walletCash.text(currentProfile.cash.toFixed(2));
  // $walletTotal.text(totalValue.toFixed(2));
}

$("#amount").on("change", function () {
  let c = market[currentProfile.currentDay].coins.find(coin => coin.code === currentProfile.selectedCoin.toLowerCase());
  console.log(coinData)
  $("#amount-value").html(`= $${$("#amount").val() * c.close}`);
});

function saveProfiles() {
  localStorage.setItem("profiles", JSON.stringify(profiles));
  console.log(profiles);
}

function loadProfilesFromStorage() {
  let data = localStorage.getItem("profiles");
  return data ? JSON.parse(data) : [];
}

// function endSimulation() {
//   $(".trading-panel").addClass("hidden");
//   $("#total-value").animate({
//     opacity: 0
//     }, 2000, function() {
//     alert("Simulation has ended. Your final portfolio value is $" + $("#total-value").text());
//     });
// }