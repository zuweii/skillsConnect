<template>
  <footer class="py-5 mt-5">
    <div class="container">
      <div class="text-center mb-4">
        <h2 class="h4 mb-3"><img src="../assets/logo.png" alt="logo" class="logo"></h2>
<div class="d-flex justify-content-center mb-4">
          <a href="#" class="mx-2"><i class="bi bi-facebook text-dark"></i></a>
          <a href="#" class="mx-2"><i class="bi bi-twitter text-dark"></i></a>
          <a href="#" class="mx-2"><i class="bi bi-instagram text-dark"></i></a>
          <a href="#" class="mx-2"><i class="bi bi-linkedin text-dark"></i></a>
        </div>
      </div>
      <div class="row justify-content-between">
        <div class="col-md-3 mb-4 mb-md-0 text-end">
          <h5>About Us</h5>
          <ul class="list-unstyled">
            <li><a href="#" class="text-decoration-none">Our Team</a></li>
            <li><a href="#" class="text-decoration-none">What we offer</a></li>
            <li><a href="#" class="text-decoration-none">Reviews</a></li>
          </ul>
        </div>
        <div class="col-md-5 mb-4 mb-md-0">
          <h5 class="text-center">Subscribe to our newsletter!</h5>
          <form class="d-flex justify-content-center">
            <div class="input-group">
              <input type="email" class="form-control" placeholder="Enter your email">
              <button type="submit" class="btn btn-outline-primary">
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </form>
        </div>
        <div class="col-md-3">
          <h5>Support</h5>
          <ul class="list-unstyled">
            <li><a href="#" class="text-decoration-none">Contact Us</a></li>
            <li><a href="#" class="text-decoration-none">FAQ</a></li>
            <li><a href="#" class="text-decoration-none">Terms & Conditions</a></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
footer {
  background-color: #c4d1f9;
}

footer a {
  color: #6c757d;
}

footer a:hover {
  color: black;
}

.input-group {
  max-width: 900px;
}

.logo {
    max-width: 150px;
}
</style>