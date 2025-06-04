function showpass(a) {
	var e = a.nextElementSibling;
	e.type == "password" ? (e.type = "text") : (e.type = "password");
}
function loadT(a) {
	var t = document.querySelector(".header-title h3");
	t.innerHTML = a;
}
function openM() {
	var n = document.querySelector(".navpanel"),
		d = document.createElement("div");
	n.classList.toggle("open");
	d.classList.add("navpanel-backdrop");
	document.body.appendChild(d);
	document.addEventListener("click", function (e) {
		if (e.target.className == "navpanel-backdrop") {
			n.classList.remove("open");
			d.remove();
		}
	});
	document
		.querySelector(".navpanel-close")
		.addEventListener("click", function (e) {
			n.classList.remove("open");
			d.remove();
		});
}
