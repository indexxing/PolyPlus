/*
  credit to goldenretriveryt on Polytoria for making the multi-decal uploading feature
*/

(async () => {
  var Settings = [];
  chrome.storage.sync.get(["PolyPlus_Settings"], async function (result) {
    let Utilities = (await import(chrome.runtime.getURL("resources/utils.js")))
      .default;
    Settings = result.PolyPlus_Settings || {
      UploadMultipleDecals: true,
    };

    if (Settings.UploadMultipleDecals === true) {
      UploadMultipleDecals();
    }

    async function UploadMultipleDecals() {
      const fileInput = document.querySelector("#file");
      fileInput.setAttribute("multiple", "true");

      const submitBtn = document.querySelector(
        "form[action^=\"/create\"] button[type=\"submit\"]"
      );
      const nameInput = document.querySelector("form[action^=\"/create\"] input[name=\"name\"]")
      console.log(submitBtn)
      submitBtn.addEventListener("click", async function (ev) {
        ev.preventDefault();
        submitBtn.disabled = true;
        submitBtn.textContent =
          "Uploading... (0/" + fileInput.files.length + ")";
        const files = fileInput.files;

        // we cant submit multiple files to the API, so we create a request for each file
        let i = 0;

        const uploadFile = async (file, index) => {
          const formData = new FormData();
          formData.append("file", file);
          
          if (nameInput.value !== "") {
            formData.append("name", nameInput.value)
          }

          try {
            const response = await Utilities.RatelimitRepeatingFetch(
              "https://polytoria.com/create/upload-decal",
              {
                method: "POST",
                body: formData,
              }
            );

            if (response.ok) {
              i++;
              submitBtn.textContent =
                "Uploading... (" + i + "/" + fileInput.files.length + ")";
            } else {
              throw new Error(response.status);
            }
          } catch (err) {
            console.error(err);
            submitBtn.textContent =
              "File " + index + " failed to upload: " + err;
            submitBtn.disabled = false;
            throw err; // re-throw the error to stop further processing
          }
        };

        const uploadFiles = async () => {
          try {
            await Promise.all(Array.from(files).map(uploadFile));
            submitBtn.textContent = "Upload";
            submitBtn.disabled = false;
            window.location.reload();
          } catch (err) {
            console.error("Some files failed to upload:", err);
          }
        };

        uploadFiles();
      });
    }
  });
})();
