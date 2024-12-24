
$(function(){
    let profiles = [];   

    // ----- Initial Page (Team Members) -----
    $("#continue-to-profiles").on("click", function(){
        $(".team-members-page").addClass("hidden");
        $(".profile-page").removeClass("hidden");

        renderProfiles();
    });      

    $("#new-profile-btn").on("click", function(){
        $("#add-box input").focus();
    });

    $("#add-profile-btn").on("click", function(){

        if($("#add-box input").val() === "") alert("Please enter a name.");

        else
        profiles.push({name: $("#add-box input").val(), initialMoney: 1000});
        renderProfiles();
    });

    renderProfiles = () => {
        $(".profile-list").empty();
        
        if((profiles.length === 0)){
            console.log("EMPTY");
            $(".profile-list").append(`
                <div class="profile">
                    <h3>EMPTY</h3>
                </div>
            `);
        }

        else{
            

            for(let i = 0; i < profiles.length; i++){
                console.log(profiles[i]);
                
                $(".profile-list").append(`
                    <div class="profile">
                        <button class="rmv-btn">Remove</button>
                        <h3>${profiles[i].name}</h3>
                        <p>Initial Money: $${profiles[i].initialMoney}</p>
                    </div>
                `);
            }
        }
    }

    $(".profile-list").on("click", ".rmv-btn", function(){
        let index = $(this).parent().index();
        profiles.splice(index, 1);
        renderProfiles();

    });

});