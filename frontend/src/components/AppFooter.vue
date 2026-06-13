<template>
  <footer class="footer">
    <div class="footer-inner">
      <p>
        UJAP · Facultad de Ingeniería · Escuela de Ingeniería de Computación
      </p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: var(--color-royal-blue-dark);
  color: rgba(255, 255, 255, 0.92);
  padding: 1rem 1.5rem;
  margin-top: auto;
  font-size: 0.875rem;
  border-top: 3px solid var(--color-orange);
}
.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  text-align: center;
}
.footer p {
  margin: 0.25rem 0;
}
</style>
