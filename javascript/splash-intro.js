window.addEventListener("load", () => {
  const animationDuration = 6000;
  const clickInterval = 1500;
  const updateInterval = 100;
  const holdTimeAt100 = 1500;

  let intervalId, percentageIntervalId;
  let elapsed = 0;

  intervalId = setInterval(() => {
    const nextModelButton = document.getElementById("nextModel");
    if (nextModelButton) {
      nextModelButton.click();
    }
  }, clickInterval);

  percentageIntervalId = setInterval(() => {
    elapsed += updateInterval;
    const percentage = Math.min(
      100,
      Math.floor((elapsed / animationDuration) * 100)
    );
    const loaderNumber = document.querySelector(".loader-number");
    if (loaderNumber) {
      loaderNumber.textContent = `${percentage} %`;
    }
  }, updateInterval);

  setTimeout(() => {
    clearInterval(intervalId);
    clearInterval(percentageIntervalId);

    const loaderNumber = document.querySelector(".loader-number");
    if (loaderNumber) {
      loaderNumber.textContent = "100%";
    }
    setTimeout(() => {
      document.querySelector(".splash-container").classList.add("fade-out");
    }, holdTimeAt100);
  }, animationDuration);
});
