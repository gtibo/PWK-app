export const cvHelper = {
  worker: null,
  load: function() {
    this.worker = new Worker("cv_worker.js");
    console.log("Loading worker...");
  },
  use: function(param, task) {
    return new Promise((resolve, reject) => {
      let listen = this.worker.addEventListener("message", (e) => {
        resolve(e.data);
        this.worker.removeEventListener("message", listen);
      })
      this.worker.postMessage({
        param,
        task
      });
    });
  }
};
