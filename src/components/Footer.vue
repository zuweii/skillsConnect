<template>
  <footer class="bg-light py-4 mt-5">
    <div class="container">
      <div class="row">
        <div class="col-md-4">
          <h5>skillsConnect</h5>
          <ul class="list-unstyled">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Our Team</a></li>
            <li><a href="#">What we offer</a></li>
            <li><a href="#">Reviews</a></li>
          </ul>
        </div>
        <div class="col-md-4">
          <h5>Follow Us</h5>
          <div class="d-flex">
            <a href="#" class="me-3"><i class="bi bi-facebook"></i></a>
            <a href="#" class="me-3"><i class="bi bi-twitter"></i></a>
            <a href="#" class="me-3"><i class="bi bi-instagram"></i></a>
            <a href="#" class="me-3"><i class="bi bi-linkedin"></i></a>
          </div>
        </div>
        <div class="col-md-4">
          <h5>Subscribe to our newsletter!</h5>
          <form class="d-flex">
            <input type="email" class="form-control me-2" placeholder="Enter your email">
            <button type="submit" class="btn btn-outline-primary"><i class="bi bi-arrow-right"></i></button>
          </form>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-md-6">
          <h5>Support</h5>
          <ul class="list-unstyled">
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Terms & Conditions</a></li>
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