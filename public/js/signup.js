document.addEventListener('DOMContentLoaded', function() {
    const sign_in_btn = document.querySelector("#sign-in-btn");
    const sign_up_btn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");
    const signUpForm = document.querySelector(".sign-up-form");
    const signInForm = document.querySelector(".sign-in-form");

    sign_up_btn.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
    });

    sign_in_btn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
    });

    // Handle signup form submission
    signUpForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const username = this.querySelector('input[placeholder="Username"]').value;
        const email = this.querySelector('input[placeholder="Email"]').value;
        const password = this.querySelector('input[placeholder="Password"]').value;
        
        if (!username || !email || !password) {
            alert("Please fill all required fields");
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            console.log('Received response data:', data); // Debug log
            
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            
            if (data.emailStatus === 'sent') {
                alert("Signup successful! 🎉 A welcome email has been sent to your inbox.");
            } else if (data.emailStatus === 'failed') {
                alert("Signup successful! But we couldn’t send the welcome email.");
            } else {
                alert("Signup successful! Email status unknown. Received status: " + (data.emailStatus || 'undefined'));
            }
            container.classList.remove("sign-up-mode");
            
        } catch (error) {
            console.error("Signup error:", error);
            alert(`Signup failed: ${error.message}`);
        }
    });
    
    // Handle login form submission
    signInForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const username = this.querySelector('input[placeholder="Username"]').value;
        const password = this.querySelector('input[placeholder="Password"]').value;
        
        if (!username || !password) {
            alert("Please fill all required fields");
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            localStorage.setItem('user', JSON.stringify({
                username: data.username,
                email: data.email,
                userId: data.userId,
                token: data.token
            }));
            
            window.location.href = "maindashboard.html"; // Redirect to main dashboard
            
        } catch (error) {
            console.error("Login error:", error);
            alert(`Login failed: ${error.message}`);
        }
    });
});