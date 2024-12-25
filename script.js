
$(function(){
    let profiles = [];   

    // ----- Initial Page (Team Members) -----
    $("#continue-to-profiles").on("click", function(){
        $(".team-members-page").addClass("hidden");
        $(".profile-page").removeClass("hidden");

        renderProfiles();
    });      

    $("#new-profile-btn").on("click", function(){
        $("#add-box").removeClass("hidden");
        $("#add-box input").focus();
    });

    $("#add-profile-btn").on("click", function(){

        if($("#add-box input").val() === "") alert("Please enter a name.");

        else
        profiles.push({name: $("#add-box input").val(), initialMoney: 1000});

        $("#add-box input").val("");
        $("#add-box").addClass("hidden");
        renderProfiles();
    });

    renderProfiles = () => {
        $(".profile-list").empty();
        
        if((profiles.length === 0)){
            $(".profile-list").append(`
                <div class="profile">
                    <h3>EMPTY</h3>
                </div>
            `);
        }

        else{
            $(".profile-list").empty();

            for(let i = 0; i < profiles.length; i++){
                $(".profile-list").append(`
                    <a class="user-wallet-link" href="#">
                   <div class="profile">
                        
                            <button class="rmv-btn">Remove</button>
                            <h3>${profiles[i].name}</h3>
                            <p>Initial Money: $${profiles[i].initialMoney}</p>
                        
                    </div>
               </a>
                `);
            }
        }
    }

    $(".profile-list").on("click", ".rmv-btn", function(e){
        let index = $(this).parent().index();
        e.preventDefault();
        profiles.splice(index, 1);
        renderProfiles();
    });


    $(".profile-list").on("click", ".user-wallet-link", function(){
        const name = $(this).data("name");
        // if (name && profiles[name]) {
          currentProfile = profiles[name];
 //         $("#current-profile-name").text(name);
          $(".profile-page").addClass("hidden");
          $("#main-content").removeClass("hidden");
          $(".header-right").removeClass("hidden");
        // }
      });
    
    $(".header-right button").on("click", function(){
        $(".profile-page").removeClass("hidden");
        $("#main-content").addClass("hidden");
        $(".header-right").addClass("hidden");
    });
});

if (localStorage.getItem("profilelist")) {
    profiles = JSON.parse(localStorage.getItem("profilelist"));
    console.log(profiles);
}


function saveProfiles() {
    localStorage.setItem("profilelist", JSON.stringify(profiles));
}