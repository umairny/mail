document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  //sent email submit
  document.querySelector('#compose-form').addEventListener('submit', () => load_mailbox('sent'));

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

//on submit
  document.querySelector('#compose-form').onsubmit = function () {
    //alert('Hello world');
  //Get the values from fields
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;
    fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      
  }); 
}


}

//Loading mainboxs
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  load(mailbox);
 
}

function load(mailbox) {
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);
              
      // Get new emails and add emails
      emails.forEach((post) => {
        // Create new post
        const new_email = document.createElement("div");

        add_email(post, new_email, mailbox);
        
        new_email.addEventListener("click", () => read_email(post["id"]));
          document.querySelector("#emails-view").appendChild(new_email);
        
        });
      })

  // Catch any errors and log them to the console
  .catch(error => {
    console.log('Error:', error);
  });
}

// Add a new post with given contents to DOM
function add_email(post, new_email, mailbox) {

    // Create new emails
    const content = document.createElement('div');
    
    // display the emails
  content.innerHTML = `<strong>${post.sender}</strong> || ${post.subject} <i> || ${post.body.slice(0, 25)}</i><p style="float:right;"><small>${post.timestamp}</small></p>`;
    
    //style the emails view
    content.className = "p-2 rounded border border-secondary";
    content.style.margin = "10px 0px";
    if (post.read == true) {
      content.className = "p-2 rounded border border-secondary text-muted bg-light";
    }

    // Add post to DOM
    new_email.appendChild(content);  
}

function read_email(id) {
  //alert("this is new email test");
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#email").style.display = "block";
  
  //erase any thing on screen
  document.querySelector("#email").innerHTML = "";
  
// Get the email's info and build the section.
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(result => {
      oneEmail(result);
    })
    .catch(error => console.log(error));

  // Set the email to read.
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true
    })
  });
}

//open the single email
function oneEmail(single) {
  const from = document.createElement("div");
  const to = document.createElement("div");
  const sub = document.createElement("div");
  const time = document.createElement("div");
  const body = document.createElement("div");
  const reply = document.createElement("button");
  const archive = document.createElement("button");

  from.innerHTML = `<strong>From: </strong> ${single.sender}`;
  to.innerHTML = `<strong>To: </strong> ${single.recipients}`;
  sub.innerHTML = `<strong>subject: </strong> ${single.subject}`;
  time.innerHTML = `${single.timestamp}`;
  body.innerHTML = `${single.body}`;
  reply.innerHTML = `Reply`;
  archive.innerHTML = `archive`;
  
  //styling the body text
  body.className = "p-3 border bg-light";
  body.style.height = "50vh";
  body.style.margin = "10px 0px";
  
  //styling the button
  reply.className = "btn btn-info m-2";
  archive.className = "btn btn-info m-2";

  //styling top lines
  from.className = "border-bottom p-1";
  to.className = "border-bottom p-1 text-muted";
  sub.className = "border-bottom p-1";
  time.className = "border-bottom p-1 text-muted";
  
  //displaying all objects on screen
  document.querySelector("#email").appendChild(from);
  document.querySelector("#email").appendChild(to);
  document.querySelector("#email").appendChild(sub);
  document.querySelector("#email").appendChild(time);
  document.querySelector("#email").appendChild(reply);
  document.querySelector("#email").appendChild(archive);
  document.querySelector("#email").appendChild(body);

  // Reply buttong
  reply.addEventListener("click", () => {
    reply_email(single);
  })

  // Archive button
  archive.innerHTML = "";
  if (single.archived) {
    archive.innerHTML += "Unarchive";
   } else {
    archive.innerHTML += "Archive";
  }
  // add event listen to archive button
  archive.addEventListener("click", () => {
    //calling archive function
    arch_email(single);
    //loading inbox
    setTimeout(() => {
      load_mailbox('inbox');  
    }, 700);
  });

}

//Archive function
function arch_email(single) {
  fetch(`/emails/${single["id"]}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: !single.archived,
      })
    });
}

function reply_email(single) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = `${single.sender}`;
  document.querySelector('#compose-subject').value = `Re: ${single.subject} `;
  document.querySelector('#compose-body').value = `On ${single.timestamp} 
  by ${single.sender} 
  Original message: ${single.body} 
  ----------------------------------------------------------------------------------------------------
  ----------------------------------------------------------------------------------------------------
  Reply here`;

//on submit
  document.querySelector('#compose-form').onsubmit = function () {
  //alert('Hello world');
  //Get the values from fields
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;
    fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      
  }); 
}


}
