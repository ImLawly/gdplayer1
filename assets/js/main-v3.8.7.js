var main = {
	spinner:
		'<span class="spinner-border spinner-border-sm" role="status"></span> Loading...',
	multiSelectSearch:
		"<input type='search' class='form-control form-control-sm' autocomplete='off' placeholder='Search'>",
	cookieConfig: {
		domain: "." + document.domain,
		path: "/",
	},
	init: function () {
		// bootstap tooltip init
		loadTooltip();

		// bootstrap custom input init
		bsCustomFileInput.init();

		// check all
		$(document).on("change", "input[type=checkbox]", function () {
			var $ck = $($(this)[0]),
				tableId = $ck.data("tableid");
			if (tableId) {
				checkAll($ck, tableId);
			}
		});

		// datatables default config
		if (typeof $.fn.DataTable !== "undefined") {
			$.extend(true, $.fn.dataTable.defaults, {
				destroy: true,
				stateSave: true,
				responsive: true,
				processing: true,
				paging: true,
				deferRender: true,
				searchDelay: 2000,
				language: {
					decimal: "",
					emptyTable: "No data available in table",
					info: "Showing _START_ to _END_ of _TOTAL_ entries",
					infoEmpty: "Showing 0 to 0 of 0 entries",
					infoFiltered: "(filtered from _MAX_ total entries)",
					infoPostFix: "",
					thousands: ",",
					lengthMenu: "Show _MENU_ entries",
					loadingRecords: "Loading...",
					processing: "Processing...",
					search: "Search:",
					zeroRecords: "No matching records found",
					aria: {
						sortAscending: ": activate to sort column ascending",
						sortDescending: ": activate to sort column descending",
					},
					paginate: {
						first: '<i class="fas fa-step-backward"></i>',
						last: '<i class="fas fa-step-forward"></i>',
						next: '<i class="fas fa-chevron-right"></i>',
						previous: '<i class="fas fa-chevron-left"></i>',
					},
				},
			});
		}

		// owl-carousel init
		$(".carousel").carousel({
			interval: 5000,
			pause: "hover",
		});

		// bootstrap sweetalert2
		$(".sweet-overlay").click(function () {
			$(this).hide();
			$(".sweet-alert")
				.removeClass("showSweetAlert visible")
				.addClass("hideSweetAlert");
		});

		// select2 init
		loadSelect2();

		// scroll to top
		$(window).on("scroll", function () {
			var $g = $("#gotoTop");
			if (
				document.body.scrollTop > 200 ||
				document.documentElement.scrollTop > 200
			) {
				$g.fadeIn();
			} else {
				$g.fadeOut();
			}
		});

		$("#gotoTop").on("click", function () {
			$("html,body").animate(
				{
					scrollTop: 0,
				},
				"slow"
			);
		});

		// ajax public init
		ajaxPOST(
			adminURL + "ajax/public/",
			{
				action: "getLoadBalancerList",
			},
			function (res) {
				localStorage.setItem("lb", JSON.stringify(res.result));
			},
			function (xhr) {
				localStorage.setItem("lb", "[]");
			}
		);

		// toastify init
		var admType = Cookies.get("adm-type", main.cookieConfig),
			admMsg = Cookies.get("adm-message", main.cookieConfig);
		if (typeof admMsg !== "undefined") {
			showToast(admMsg.trim(), admType, function () {
				Cookies.remove("adm-type", main.cookieConfig);
				Cookies.remove("adm-message", main.cookieConfig);
			});
		}

		// supported sites collapse init
		var clSites = localStorage.getItem("collapseSites");
		clSites = clSites !== null ? clSites.replace("true", "show") : "hide";
		$("#collapseSites").collapse(clSites);
		$("#collapseSites")
			.on("shown.bs.collapse", function () {
				localStorage.setItem("collapseSites", true);
			})
			.on("hidden.bs.collapse", function () {
				localStorage.removeItem("collapseSites", true);
			});

		$("#txtSearchHost").on("blur keyup change", function () {
			searchHost($(this).val().toLowerCase());
		});

		// show/hide password
		$(".btn-shp").click(function () {
			var e = $(this).data("shp");
			if (typeof e !== "undefined") {
				if ($(e).attr("type") === "password") {
					$(e).attr("type", "text");
					$(this)
						.find(".fas")
						.removeClass("fa-eye")
						.addClass("fa-eye-slash");
				} else {
					$(e).attr("type", "password");
					$(this)
						.find(".fas")
						.removeClass("fa-eye-slash")
						.addClass("fa-eye");
				}
			}
		});

		$("#user").change(function () {
			$.ajax({
				url: adminURL + "ajax/public/",
				type: "POST",
				data: {
					action: "checkUsername",
					username: $(this).val(),
				},
				success: function (res) {
					var msg = res.status !== "fail" ? "" : res.message;
					ajaxValidation("#user", msg);
				},
				error: function (xhr) {},
			});
		});

		$("#email").change(function () {
			$.ajax({
				url: adminURL + "ajax/public/",
				type: "POST",
				data: {
					action: "checkEmail",
					email: $(this).val(),
				},
				success: function (res) {
					var msg = res.status !== "fail" ? "" : res.message;
					ajaxValidation("#email", msg);
				},
				error: function (xhr) {},
			});
		});

		$("#retype_password").change(function () {
			var el = "#retype_password";
			if ($(this).val() !== $("#password").val()) {
				matchValidation(
					el,
					"The confirm password must be the same as the password"
				);
			} else {
				matchValidation(el, "");
			}
		});
	},
};
var dashboard = {
	ajaxURL: adminURL + "ajax/dashboard/",
	videosURL: adminURL + "ajax/videos-list/",
	popularVideos: {
		list: function () {
			if ($("#tbPopularVideos").length) {
				$("#tbPopularVideos").DataTable({
					ajax: dashboard.videosURL + "?popular=true",
					serverSide: true,
					columns: [
						{
							data: "title",
							responsivePriority: 0,
							render: function (value, type, row, meta) {
								if (value === "") value = "(No Title)";
								return (
									'<div class="title" contentEditable="plaintext-only" data-toggle="tooltip" title="' +
									value +
									'">' +
									value +
									"</div>"
								);
							},
						},
						{
							data: "host",
							className: "text-center",
							responsivePriority: 1,
							render: function (value, type, row, meta) {
								if (row.alt_count > 0) {
									return (
										'<div class="dropdown"><button class="btn btn-outline-default btn-sm dropdown-toggle alt" type="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-expanded="false" data-id="' +
										row.id +
										'"><img src="' +
										imgCDNURL +
										"assets/img/logo/" +
										value +
										'.png" width="16" height="16"></button><div class="dropdown-menu shadow border-0" style="max-height:240px"></div></div>'
									);
								} else {
									return (
										'<a href="' +
										row.link +
										'" target="_blank" title="' +
										(typeof vidHosts[value] !== "undefined"
											? vidHosts[value]
											: value
										)
											.replace("|Additional Host", "")
											.replace("|New", "") +
										'" data-toggle="tooltip"><img src="' +
										imgCDNURL +
										"assets/img/logo/" +
										value +
										'.png" width="16" height="16"></a>'
									);
								}
							},
						},
						{
							data: "views",
							className: "text-right",
						},
						{
							data: "name",
						},
						{
							data: "added",
							className: "text-right",
							render: function (value, type, row) {
								return formatTimestamp(value);
							},
						},
						{
							data: "id",
							className: "text-center",
							responsivePriority: 2,
							render: function (value, type, row) {
								return (
									'<div class=""dropdown"">' +
									btnCog() +
									'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
									btnCopyEmbed(row.actions.embed_code) +
									btnEmbed(row.actions.embed) +
									btnDownload(row.actions.download) +
									'<div class="dropdown-divider"></div>' +
									btnEditItem(
										adminURL + "videos/edit/?id=" + value
									) +
									'<button data-id="' +
									value +
									'" onclick="videos.cache.clear.single($(this));" class="dropdown-item" type="button"><i class="fas fa-eraser mr-2 me-2"></i>Clear Cache</button></div></div>'
								);
							},
						},
					],
					ordering: false,
					lengthMenu: [7],
					pageLength: 7,
					searching: false,
					bLengthChange: false,
					info: false,
					paging: false,
					columnDefs: [
						{
							orderable: false,
							targets: [0, 1, 2, 3, 4, 5],
						},
						{
							visible: true,
							targets: [0, 1],
							className: "noVis",
						},
					],
					drawCallback: function () {
						loadTooltip();
						$("#tbPopularVideos button.alt").click(function () {
							videos.alternatives.get($(this));
						});
						$("#tbPopularVideos button.copy-embed").click(
							function () {
								copyText($(this).data("text"), "Embed");
							}
						);
					},
				});
			}
		},
	},
	recentVideos: {
		list: function () {
			if ($("#tbRecentVideos").length) {
				$("#tbRecentVideos").DataTable({
					ajax: dashboard.videosURL + "?recent=true",
					serverSide: true,
					columns: [
						{
							data: "title",
							responsivePriority: 0,
							render: function (value, type, row, meta) {
								if (value === "") value = "(No Title)";
								return (
									'<div class="title" contentEditable="plaintext-only" data-toggle="tooltip" title="' +
									value +
									'">' +
									value +
									"</div>"
								);
							},
						},
						{
							data: "host",
							responsivePriority: 1,
							className: "text-center",
							render: function (value, type, row, meta) {
								if (row.alt_count > 0) {
									return (
										'<div class="dropdown"><button class="btn btn-outline-default btn-sm dropdown-toggle alt" type="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-expanded="false" data-id="' +
										row.id +
										'"><img src="' +
										imgCDNURL +
										"assets/img/logo/" +
										value +
										'.png" width="16" height="16"></button><div class="dropdown-menu shadow border-0" style="max-height:240px"></div></div>'
									);
								} else {
									return (
										'<a href="' +
										row.link +
										'" target="_blank" title="' +
										(typeof vidHosts[value] !== "undefined"
											? vidHosts[value]
											: value
										)
											.replace("|Additional Host", "")
											.replace("|New", "") +
										'" data-toggle="tooltip"><img src="' +
										imgCDNURL +
										"assets/img/logo/" +
										value +
										'.png" width="16" height="16"></a>'
									);
								}
							},
						},
						{
							data: "views",
							className: "text-right",
						},
						{
							data: "name",
						},
						{
							data: "added",
							className: "text-right",
							render: function (value, type, row) {
								return formatTimestamp(value);
							},
						},
						{
							data: "id",
							className: "text-center",
							responsivePriority: 2,
							render: function (value, type, row) {
								return (
									'<div class=""dropdown"">' +
									btnCog() +
									'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
									btnCopyEmbed(row.actions.embed_code) +
									btnEmbed(row.actions.embed) +
									btnDownload(row.actions.download) +
									'<div class="dropdown-divider"></div>' +
									btnEditItem(
										adminURL + "videos/edit/?id=" + value
									) +
									'<button data-id="' +
									value +
									'" onclick="videos.cache.clear.single($(this));" class="dropdown-item" type="button"><i class="fas fa-eraser mr-2 me-2"></i>Clear Cache</button></div></div>'
								);
							},
						},
					],
					ordering: false,
					lengthMenu: [7],
					pageLength: 7,
					searching: false,
					bLengthChange: false,
					info: false,
					paging: false,
					columnDefs: [
						{
							orderable: false,
						},
						{
							visible: true,
							targets: [0, 1],
							className: "noVis",
						},
					],
					drawCallback: function () {
						loadTooltip();
						$("#tbRecentVideos button.alt").click(function () {
							videos.alternatives.get($(this));
						});
						$("#tbRecentVideos button.copy-embed").click(
							function () {
								copyText($(this).data("text"), "Embed");
							}
						);
					},
				});
			}
		},
	},
	chart: {
		isDarkMode: function () {
			if (Cookies.get("theme") === "dark") {
				return {
					backgroundColor: "#191d21",
					foreColor: "#f0f0f0",
					mode: "dark",
				};
			}
			return {
				backgroundColor: "#fff",
				foreColor: "#333",
				mode: "light",
			};
		},
		apex: {
			videoStatus: undefined,
			serverStatus: undefined,
			views: undefined,
		},
		videoStatus: function (el) {
			var $chart = document.querySelector(el + " > .chart"),
				$load = $(el + " > .fa-spin"),
				darkOpt = dashboard.chart.isDarkMode(),
				options = {
					chart: {
						id: "videoStatus",
						type: "donut",
						foreColor: darkOpt.foreColor,
						backgroundColor: darkOpt.backgroundColor,
					},
					theme: {
						mode: darkOpt.mode,
					},
					legend: {
						position: "bottom",
					},
					series: [],
					labels: ["Good", "Broken", "Warning"],
					colors: ["#28a745", "#dc3545", "#feb019"],
				};
			if ($chart !== null) {
				$load.show();
				$chart.style.display = "none";
				ajaxPOST(
					dashboard.ajaxURL,
					{
						action: "videosStatus",
					},
					function (res) {
						$load.hide();
						$chart.style.display = "block";
						if (res.status !== "fail") {
							options.series[0] = res.result.good;
							options.series[1] = res.result.broken;
							options.series[2] = res.result.warning;
							$("#numVideos").text(res.result.total_videos);
							$("#numBrokenVideos").text(res.result.broken);
							$("#numServers").text(res.result.total_servers);
							$("#numGDrives").text(res.result.total_gdrives);
						}
						dashboard.chart.apex.videoStatus = new ApexCharts(
							$chart,
							options
						);
						dashboard.chart.apex.videoStatus.render();
					},
					function (xhr) {
						$load.hide();
						$chart.style.display = "block";
						dashboard.chart.apex.videoStatus = new ApexCharts(
							$chart,
							options
						);
						dashboard.chart.apex.videoStatus.render();
					}
				);
			} else {
				$load.hide();
			}
		},
		serverStatus: function (el) {
			var $chart = document.querySelector(el + " > .chart"),
				$load = $(el + " > .fa-spin"),
				darkOpt = dashboard.chart.isDarkMode(),
				options = {
					chart: {
						id: "serverStatus",
						type: "pie",
						foreColor: darkOpt.foreColor,
						backgroundColor: darkOpt.backgroundColor,
					},
					theme: {
						mode: darkOpt.mode,
					},
					legend: {
						position: "bottom",
					},
					series: [],
					labels: [],
				};
			if ($chart !== null) {
				$load.show();
				$chart.style.display = "none";
				ajaxPOST(
					dashboard.ajaxURL,
					{
						action: "serversStatus",
					},
					function (res) {
						$load.hide();
						if (res.status !== "fail") {
							$chart.style.display = "block";
							options.labels = Object.keys(res.result);
							options.series = Object.values(res.result);
							dashboard.chart.apex.serverStatus = new ApexCharts(
								$chart,
								options
							);
							dashboard.chart.apex.serverStatus.render();
						}
					},
					function (xhr) {
						$load.hide();
						$chart.style.display = "block";
						dashboard.chart.apex.serverStatus = new ApexCharts(
							$chart,
							options
						);
						dashboard.chart.apex.serverStatus.render();
					}
				);
			} else {
				$load.hide();
			}
		},
		views: {
			options: {
				series: [
					{
						name: "Visitors",
						data: [],
					},
				],
				noData: {
					text: "No data",
					align: "center",
					verticalAlign: "middle",
					offsetX: 0,
					offsetY: 0,
					style: {
						fontSize: "15px",
					},
				},
				chart: {
					id: "chartViews",
					type: "area",
					height: 300,
					toolbar: {
						show: false,
					},
					zoom: {
						enabled: false,
					},
				},
				theme: {
					mode: "light",
				},
				dataLabels: {
					enabled: false,
				},
				markers: {
					size: 0,
					style: "hollow",
				},
				xaxis: {
					type: "datetime",
					tickAmount: 6,
					labels: {
						datetimeUTC: false,
					},
				},
				tooltip: {
					x: {
						format: "dd MMM yyyy",
					},
				},
				fill: {
					type: "gradient",
					gradient: {
						shadeIntensity: 1,
						opacityFrom: 0.7,
						opacityTo: 0.9,
						stops: [0, 100],
					},
				},
			},
			load: function (filter, uid, $chart) {
				var $load = $("#views > .fas, #userViews > .fas"),
					options = dashboard.chart.views.options,
					darkOpt = dashboard.chart.isDarkMode();
				options["colors"] = window.themeColors;
				options["fill"] = {
					gradient: {
						gradientColors: window.themeColors,
						shadeIntensity: 1,
						opacityFrom: 0.7,
						opacityTo: 0.9,
						stops: [0, 100],
					},
				};
				if ($chart) {
					$chart.innerHTMl = "";
					options.chart.foreColor = darkOpt.foreColor;
					options.chart.backgroundColor = darkOpt.backgroundColor;
					options.theme.mode = darkOpt.mode;
					$load.show();
					ajaxPOST(
						dashboard.ajaxURL,
						{
							action: "views",
							filter: filter,
							uid: uid,
						},
						function (res) {
							var data = [];
							$load.hide();
							if (res.status !== "fail") {
								if (res.result.length < 30) {
									options.dataLabels.enabled = true;
								}
								if (res.result.length) {
									$.each(res.result, function (i, v) {
										data.push([v[0] * 1000, v[1]]);
									});
								}
								options.series = [
									{
										name: "Visitors",
										data: data,
									},
								];
								if (dashboard.chart.apex.views === undefined) {
									dashboard.chart.apex.views = new ApexCharts(
										$chart,
										options
									);
									dashboard.chart.apex.views.render();
								} else {
									dashboard.chart.apex.views.updateOptions(
										options
									);
								}
							}
						},
						function (xhr) {
							$load.hide();
						}
					);
				}
			},
		},
	},
	supportChecker: function () {
		if (location.href.indexOf("/dashboard") > -1) {
			var $md = $("#modalExtApps"),
				changeStatus = function (id, status, app) {
					if (status) {
						app = app ? "Installed" : "Enabled";
						$(id).html(
							'<i class="fas fa-check-circle text-success mr-2 me-2"></i>' +
								app
						);
					} else {
						app = app ? "Uninstalled" : "Disabled";
						$(id).html(
							'<i class="fas fa-times-circle text-danger mr-2 me-2"></i>' +
								app
						);
					}
				};
			$md.find(".btn-success")
				.html('<i class="fas fa-spin fa-refresh mr-2 me-2"></i>Re-check')
				.prop("disable", true);
			ajaxPOST(
				adminURL + "ajax/settings/",
				{
					action: "getDependencies",
				},
				function (res) {
					var keys;
					if (res.result !== null) {
						keys = Object.keys(res.result);
						$.each(keys, function (i, v) {
							changeStatus(
								"#php_" + v,
								res.result[v],
								v === "chrome"
							);
						});
						$md.find(".btn-success")
							.text("Re-check")
							.prop("disable", false);
						if (res.status === "fail") {
							$md.modal("show");
						} else {
							$md.modal("hide");
						}
					}
				},
				function (xhr) {
					$md.find(".btn-success")
						.text("Re-check")
						.prop("disable", false);
					$md.modal("show");
				}
			);
		}
	},
};
var gdrive_accounts = {
	url: adminURL + "ajax/gdrive-accounts/",
	delete: {
		ajax: function (id, sCallback, eCallback) {
			ajaxPOST(
				gdrive_accounts.url,
				{
					id: id,
					action: "delete",
				},
				sCallback,
				eCallback
			);
		},
		single: function ($e) {
			swalQuestion(
				"Are you sure?",
				"Delete the '" +
					$e.data("name") +
					"' account. " +
					notRecovered(),
				function (isConfirm) {
					if (!isConfirm) return;
					gdrive_accounts.delete.ajax(
						$e.data("id"),
						function (res) {
							if (res.status === "ok") {
								gdrive_accounts.reload();
								swalSuccess(res.message);
							} else {
								swalError(res.message);
							}
						},
						function (xhr) {
							swalError(xhr.responseText);
						}
					);
				}
			);
		},
		multi: function () {
			var ids = [],
				deleted = [],
				failed = [];
			$("#ckAllGDA, #ckAllGDA1").prop("checked", false);
			$("#tbGDAccounts tbody input[type=checkbox]:checked").each(
				function () {
					ids.push($(this).val());
				}
			);
			if (ids.length > 0) {
				var callback = function (res, currentIndex) {
						var nextIndex = currentIndex + 1,
							total = 0;
						if (res.status !== "fail") {
							deleted.push(ids[currentIndex]);
						} else {
							failed.push(ids[currentIndex]);
						}
						total = deleted.length + failed.length;
						if (total >= ids.length) {
							gdrive_accounts.reload();
							if (failed.length > 0) {
								swalInfo(
									"The " +
										deleted.length +
										" accounts have been successfully deleted and the other " +
										failed.length +
										" accounts failed to be deleted."
								);
							} else {
								swalSuccess(
									"These " +
										total +
										" accounts have been successfully deleted."
								);
							}
						} else {
							deleteNow(ids[nextIndex], nextIndex);
						}
					},
					deleteNow = function (id, currentIndex) {
						gdrive_accounts.delete.ajax(
							id,
							function (res) {
								callback(res, currentIndex);
							},
							function (xhr) {
								callback({ status: "fail" }, currentIndex);
							}
						);
					};
				swalQuestion(
					"Are you sure?",
					"You will delete these " +
						ids.length +
						" accounts. " +
						notRecovered(),
					function (isConfirm) {
						if (!isConfirm) return;
						deleteNow(ids[0], 0);
					}
				);
			} else {
				swalWarning(
					"Please check the accounts you want to delete first."
				);
			}
		},
	},
	update_status: {
		ajax: function (data, sCallback, eCallback) {
			ajaxPOST(gdrive_accounts.url, data, sCallback, eCallback);
		},
		single: function ($e, col) {
			gdrive_accounts.update_status.ajax(
				{
					id: $e.data("id"),
					status: $e.data(col),
					action: "update" + capitalizeWords(col),
				},
				function (res) {
					if (res.status !== "fail") {
						gdrive_accounts.reload();
						swalSuccess(res.message);
					} else {
						swalError(res.message);
					}
				},
				function (xhr) {
					swalError(xhr.responseText);
				}
			);
		},
	},
	list: function () {
		if ($("#tbGDAccounts").length) {
			$("#tbGDAccounts").DataTable({
				ajax: adminURL + "ajax/gdrive-accounts-list/",
				serverSide: true,
				columns: [
					{
						data: "id",
						className: "text-center",
						render: function (value, type, row, meta) {
							return btnCheckbox(
								value,
								"gdaccount",
								"#tbGDAccounts"
							);
						},
					},
					{
						data: "email",
						responsivePriority: 0,
					},
					{
						data: "bypass",
						responsivePriority: 1,
						className: "text-center",
						render: function (value, type, row, meta) {
							var icon = "fa-times-circle text-danger",
								title = "Disable";
							if (value == 1) {
								icon = "fa-check-circle text-success";
								title = "Enable";
								value = 0;
							} else {
								value = 1;
							}
							return (
								'<a href="javascript:void(0)" role="button" data-id="' +
								row.id +
								'" data-bypass="' +
								value +
								'" class="bypass" data-toggle="tooltip" title="' +
								title +
								'"><i class="fas fa-lg ' +
								icon +
								'"></i></a>'
							);
						},
					},
					{
						data: "status",
						responsivePriority: 1,
						className: "text-center",
						render: function (value, type, row, meta) {
							var icon = "fa-times-circle text-danger",
								title = "Disable";
							if (value == 1) {
								icon = "fa-check-circle text-success";
								title = "Enable";
								value = 0;
							} else {
								value = 1;
							}
							return (
								'<a href="javascript:void(0)" role="button" data-id="' +
								row.id +
								'" data-status="' +
								value +
								'" class="status" data-toggle="tooltip" title="' +
								title +
								'"><i class="fas fa-lg ' +
								icon +
								'"></i></a>'
							);
						},
					},
					{
						data: "created",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "modified",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "id",
						className: "text-center",
						responsivePriority: 2,
						render: function (value, type, row) {
							return (
								'<div class="dropdown">' +
								btnCog() +
								'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
								btnEditItem(
									adminURL + "gdrive/edit/?id=" + value
								) +
								btnDeleteItem(value, row.email) +
								"</div></div>"
							);
						},
					},
				],
				columnDefs: [
					{
						orderable: false,
						targets: [0, 6],
					},
					{
						visible: true,
						targets: [0, 1, 6],
						className: "noVis",
					},
				],
				order: [[1, "asc"]],
				drawCallback: function () {
					loadTooltip();
					$("#tbGDAccounts a.status").click(function () {
						gdrive_accounts.update_status.single($(this), "status");
					});
					$("#tbGDAccounts a.bypass").click(function () {
						gdrive_accounts.update_status.single($(this), "bypass");
					});
					$("#tbGDAccounts button.delete").click(function () {
						gdrive_accounts.delete.single($(this));
					});
				},
			});
		}
	},
	reload: function () {
		$("#ckAllGDA, #ckAllGDA1").prop("checked", false);
		$(".toolbar .btn-hidden").addClass("d-none");
		$("#tbGDAccounts").DataTable().ajax.reload(null, false);
	},
};
var gdrive_files = {
	url: adminURL + "ajax/gdrive-files/",
	removeDuplicateFiles: function (nextPageToken) {
		var $btn = $("#btnGDuplicate");
		$btn.find(".fas").removeClass("fa-copy").addClass("fa-spin fa-rotate");
		$btn.prop("disabled", true);
		ajaxPOST(
			gdrive_files.url,
			{
				email: $_GET("email"),
				action: "removeDuplicateFiles",
				nextPageToken: nextPageToken,
			},
			function (res) {
				$btn.find(".fas")
					.removeClass("fa-spin fa-rotate")
					.addClass("fa-copy");
				$btn.prop("disabled", false);
				if (res.status !== "fail") {
					if (res.result.nextPageToken !== "") {
						gdrive_files.removeDuplicateFiles(
							res.result.nextPageToken
						);
					} else {
						swalSuccess(res.message);
					}
				} else {
					swalError(res.message);
				}
			},
			function (xhr) {
				$btn.find(".fas")
					.removeClass("fa-spin fa-rotate")
					.addClass("fa-copy");
				$btn.prop("disabled", false);
				swalError(xhr.responseText);
			}
		);
	},
	update_status: {
		ajax: function (data, sCallback, eCallback) {
			ajaxPOST(gdrive_files.url, data, sCallback, eCallback);
		},
		single: function ($e) {
			gdrive_files.update_status.ajax(
				{
					id: $e.data("id"),
					email: $_GET("email"),
					action: "updateStatus",
					public: $e.data("status") == "public",
				},
				function (res) {
					if (res.status !== "fail") {
						gdrive_files.reload();
						swalSuccess(res.message);
					} else {
						swalError(res.message);
					}
				},
				function (xhr) {
					swalError(xhr.responseText);
				}
			);
		},
		multi: function (newStatus) {
			var ids = [],
				updated = [],
				failed = [];
			$("#ckAllGDF, #ckAllGDF1").prop("checked", false);
			$("#tbGDFiles tbody input[type=checkbox]:checked").each(
				function () {
					ids.push($(this).val());
				}
			);
			if (ids.length > 0) {
				var callback = function (res, currentIndex) {
						var nextIndex = currentIndex + 1,
							total = 0;
						if (res.status !== "fail") {
							updated.push(ids[currentIndex]);
						} else {
							failed.push(ids[currentIndex]);
						}
						total = updated.length + failed.length;
						if (total >= ids.length) {
							gdrive_files.reload();
							if (failed.length > 0) {
								swalInfo(
									updated.length +
										" files have been updated successfully and " +
										failed.length +
										" other files failed to update."
								);
							} else {
								swalSuccess(
									"These " +
										total +
										" files have been successfully updated."
								);
							}
						} else {
							updateNow(ids[nextIndex], nextIndex);
						}
					},
					updateNow = function (id, currentIndex) {
						gdrive_files.update_status.ajax(
							{
								id: id,
								email: $_GET("email"),
								action: "updateStatus",
								public: newStatus === "public",
							},
							function (res) {
								callback(res, currentIndex);
							},
							function (xhr) {
								callback({ status: "fail" }, currentIndex);
							}
						);
					};
				swalQuestion(
					"Are you sure?",
					"You will change the status of those " +
						ids.length +
						" files to " +
						newStatus +
						".",
					function (isConfirm) {
						if (!isConfirm) return;
						updateNow(ids[0], 0);
					}
				);
			} else {
				swalWarning(
					"Please check the files that you want to change the status of first."
				);
			}
		},
	},
	reload: function () {
		$("#ckAllGDF, #ckAllGDF1").prop("checked", false);
		$(".toolbar .btn-hidden").addClass("d-none");
		$("#tbGDFiles").DataTable().ajax.reload(null, false);
	},
	list: function () {
		if ($("#tbGDFiles").length) {
			var email = $("select#email").val(),
				md5Email = md5(email);
			$("#tbGDFiles")
				.on("preXhr.dt", function (e, s, data) {
					var p = s._iDisplayStart - s._iDisplayLength;
					data.private = $("#onlyPrivate").is(":checked");
					data.onlyFolder = $("#onlyFolder").is(":checked");
					if (email !== null) {
						data.email = email;
						data.folder_id = $_GET("folder_id");
					}
					if (p >= 0) {
						data.token = localStorage.getItem(
							"nextPageToken-" + md5Email + "-" + p
						);
					}
				})
				.DataTable({
					ajax: adminURL + "ajax/gdrive-files-list/",
					serverSide: true,
					info: false,
					pagingType: "simple",
					columns: [
						{
							data: "id",
							responsivePriority: 0,
							className: "text-center",
							render: function (value, type, row, meta) {
								return btnCheckbox(
									value,
									"gdfile",
									"#tbGDFiles"
								);
							},
						},
						{
							data: "title",
							responsivePriority: 1,
							render: function (value, type, row, meta) {
								if (
									"type" in row.mimeType &&
									row.mimeType.type.indexOf(".folder") === -1
								) {
									return (
										'<div class="title" contentEditable="plaintext-only" data-toggle="tooltip" title="' +
										value +
										'"><img src="' +
										row.mimeType.icon +
										'" class="mr-2 me-2">' +
										value +
										"</div>"
									);
								} else {
									if (row.id !== "") {
										return (
											'<a href="' +
											adminURL +
											"gdrive/files/?email=" +
											row.email +
											"&folder_id=" +
											row.id +
											'" class="title" data-toggle="tooltip" title="' +
											value +
											'"><img src="' +
											row.mimeType.icon +
											'" class="mr-2 me-2">' +
											value +
											"</a>"
										);
									} else {
										return (
											'<a href="' +
											adminURL +
											"gdrive/files/?email=" +
											row.email +
											'" class="title" data-toggle="tooltip" title="Back">' +
											value +
											"</a>"
										);
									}
								}
							},
						},
						{
							data: "desc",
							responsivePriority: 2,
							render: function (value, type, row, meta) {
								return (
									'<div class="title" contentEditable="plaintext-only" data-toggle="tooltip" title="' +
									value +
									'">' +
									value +
									"</div>"
								);
							},
						},
						{
							data: "shared",
							className: "text-center",
							render: function (value, type, row, meta) {
								return (
									'<i class="fas fa-lg fa-' +
									(value
										? "check-circle text-success"
										: "times-circle text-danger") +
									'"></i>'
								);
							},
						},
						{
							data: "modifiedDate",
							className: "text-right",
							render: function (value, type, row) {
								return formatTimestamp(value);
							},
						},
						{
							data: "actions",
							className: "text-center",
							responsivePriority: 3,
							render: function (value, type, row, meta) {
								if (row.id !== "") {
									var html =
										'<button type="button" class="dropdown-item rename" data-id="' +
										value.id +
										'" data-name="' +
										row.title +
										'"><i class="fas fa-pen-to-square mr-2 me-2"></i>Rename</button>';
									if (value.shared) {
										html +=
											'<button type="button" class="dropdown-item private" data-id="' +
											value.id +
											'" data-status="private" title="Make it Private"><i class="fas fa-eye-slash mr-2 me-2"></i>Private</button>';
									} else {
										html +=
											'<button type="button" class="dropdown-item public" data-id="' +
											value.id +
											'" data-status="public" title="Share with the Public"><i class="fas fa-eye mr-2 me-2"></i>Public</button>';
									}
									html +=
										'<button type="button" class="dropdown-item delete" data-id="' +
										value.id +
										'" data-name="' +
										row.title +
										(row.desc !== ""
											? " - " + row.desc
											: "") +
										'"><i class="fas fa-trash mr-2 me-2"></i>Delete</button>';
									if (
										"type" in row.mimeType &&
										row.mimeType.type.indexOf(".folder") ===
											-1
									) {
										html +=
											'<div class="dropdown-divider"></div><a class="dropdown-item" href="' +
											value.view +
											'" target="_blank"><i class="fas fa-binoculars mr-2 me-2"></i>View</a><a class="dropdown-item" href="' +
											value.download +
											'" target="_blank"><i class="fas fa-download mr-2 me-2"></i>Download</a><a class="dropdown-item" href="' +
											value.preview +
											'" target="_blank"><i class="fas fa-magnifying-glass mr-2 me-2"></i>Preview</a><div class="dropdown-divider"></div>' +
											btnEmbed(value.embed_url) +
											btnDownload(value.download_url) +
											btnCopyEmbed(value.embed_code);
									}
									return (
										'<div class=""dropdown"">' +
										btnCog() +
										'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
										html +
										"</div></div>"
									);
								} else {
									return "";
								}
							},
						},
					],
					columnDefs: [
						{
							orderable: false,
							targets: [0, 2, 3, 5],
						},
						{
							visible: true,
							targets: [0, 1, 2],
							className: "noVis",
						},
					],
					order: [[4, "desc"]],
					drawCallback: function (s) {
						if (
							email !== null &&
							typeof s.json.token !== "undefined" &&
							s.json.token !== null &&
							s.json.token !== ""
						) {
							localStorage.setItem(
								"nextPageToken-" +
									md5Email +
									"-" +
									s._iDisplayStart,
								s.json.token
							);
						}
						$(
							"#tbGDFiles button.public, #tbGDFiles button.private"
						).click(function () {
							gdrive_files.update_status.single($(this));
						});
						$("#tbGDFiles button.delete").click(function () {
							gdrive_files.delete.single($(this));
						});
						$("#tbGDFiles button.rename").click(function () {
							gdrive_files.rename($(this));
						});
						$("#tbGDFiles button.copy-embed").click(function () {
							copyText($(this).data("text"), "Embed");
						});
						gdrive_files.loadDrives();
						loadTooltip();
					},
				});
		}
	},
	delete: {
		ajax: function (id, sCallback, eCallback) {
			ajaxPOST(
				gdrive_files.url,
				{
					id: id,
					email: $_GET("email"),
					action: "delete",
				},
				sCallback,
				eCallback
			);
		},
		single: function ($e) {
			swalQuestion(
				"Are you sure?",
				"Delete the '" + $e.data("name") + "' file.",
				function (isConfirm) {
					if (!isConfirm) return;
					gdrive_files.delete.ajax(
						$e.data("id"),
						function (res) {
							if (res.status !== "fail") {
								gdrive_files.reload();
								swalSuccess(res.message);
							} else {
								swalError(res.message);
							}
						},
						function (xhr) {
							swalError(xhr.responseText);
						}
					);
				}
			);
		},
		multi: function () {
			var ids = [],
				deleted = [],
				failed = [];
			$("#ckAllGDF, #ckAllGDF1").prop("checked", false);
			$("#tbGDFiles tbody input[type=checkbox]:checked").each(
				function () {
					ids.push($(this).val());
				}
			);
			if (ids.length > 0) {
				var callback = function (res, currentIndex) {
						var nextIndex = currentIndex + 1,
							total = 0;
						if (res.status !== "fail") {
							deleted.push(ids[currentIndex]);
						} else {
							failed.push(ids[currentIndex]);
						}
						total = deleted.length + failed.length;
						if (total >= ids.length) {
							gdrive_files.reload();
							if (failed.length > 0) {
								swalInfo(
									"The " +
										deleted.length +
										" files have been successfully deleted and the other " +
										failed.length +
										" files failed to be deleted."
								);
							} else {
								swalSuccess(
									"The " +
										total +
										" files have been successfully deleted."
								);
							}
						} else {
							deleteNow(ids[nextIndex], nextIndex);
						}
					},
					deleteNow = function (id, currentIndex) {
						gdrive_files.delete.ajax(
							id,
							function (res) {
								callback(res, currentIndex);
							},
							function (xhr) {
								callback({ status: "fail" }, currentIndex);
							}
						);
					};
				swalQuestion(
					"Are you sure?",
					"You will delete these " + ids.length + " files.",
					function (isConfirm) {
						if (!isConfirm) return;
						deleteNow(ids[0], 0);
					}
				);
			} else {
				swalWarning("Please check the files you want to delete first.");
			}
		},
	},
	newFolder: function () {
		swal(
			{
				title: "Create New Folder",
				type: "input",
				showLoaderOnConfirm: true,
				showCancelButton: true,
				closeOnConfirm: false,
				cancelButtonClass: "btn-secondary",
				confirmButtonClass: "btn-success",
				inputPlaceholder: "Folder Name",
				confirmButtonText: "Save",
			},
			function (name) {
				if (name === false) return false;
				if (name.trim() === "") {
					swal.showInputError("You need to write something!");
					return false;
				}
				var parent_id = $_GET("folder_id");
				parent_id = parent_id !== null ? parent_id : "root";
				$.ajax({
					url: gdrive_files.url,
					method: "POST",
					dataType: "json",
					data:
						"action=createNewFolder&name=" +
						name +
						"&parent_id=" +
						parent_id +
						"&email=" +
						$("select#email").val(),
					success: function (res) {
						if (res.status !== "fail") {
							gdrive_files.reload();
							swalSuccess(res.message);
						} else {
							swalError(res.message);
						}
					},
					error: function (xhr) {
						swalError(xhr.responseText);
					},
				});
			}
		);
	},
	changeEmail: function ($e) {
		localStorage.clear();
		location.href = location.href.split("?")[0] + "?email=" + $e.val();
	},
	import: {
		ajax: function (id, sCallback, eCallback) {
			ajaxPOST(
				gdrive_files.url,
				{
					id: id,
					action: "gdriveImport",
				},
				sCallback,
				eCallback
			);
		},
		single: function ($e) {
			gdrive_files.import.ajax(
				$e.data("id"),
				function (res) {
					if (res.status !== "fail") {
						swalSuccess(res.message);
					} else {
						swalError(res.message);
					}
				},
				function (xhr) {
					swalError(xhr.responseText);
				}
			);
		},
		multi: function () {
			var ids = [],
				imported = [],
				failed = [];
			$("#ckAllGDF, #ckAllGDF1").prop("checked", false);
			$("#tbGDFiles tbody input[type=checkbox]:checked").each(
				function () {
					ids.push($(this).val());
				}
			);
			if (ids.length > 0) {
				var callback = function (res, currentIndex) {
						var nextIndex = currentIndex + 1,
							total = 0;
						if (res.status !== "fail") {
							imported.push(ids[currentIndex]);
						} else {
							failed.push(ids[currentIndex]);
						}
						total = imported.length + failed.length;
						if (total >= ids.length) {
							if (failed.length > 0) {
								swalInfo(
									"The " +
										imported.length +
										" files have been successfully imported and the other " +
										failed.length +
										" files failed to be imported."
								);
							} else {
								swalSuccess(
									"The " +
										total +
										" files have been successfully imported."
								);
							}
							gdrive_files.reload();
						} else {
							importNow(ids[nextIndex], nextIndex);
						}
					},
					importNow = function (id, currentIndex) {
						gdrive_files.import.ajax(
							id,
							function (res) {
								callback(res, currentIndex);
							},
							function (xhr) {
								callback({ status: "fail" }, currentIndex);
							}
						);
					};
				importNow(ids[0], 0);
			} else {
				swalWarning("Please check the files you want to import first.");
			}
		},
	},
	loadDrives: function () {
		var $opt = $("#drives").find("optgroup");
		ajaxPOST(
			gdrive_files.url,
			{
				email: $_GET("email"),
				action: "getSharedDrives",
			},
			function (data) {
				if (data.result.length) {
					$opt.html("");
					for (var i in data.result) {
						$opt.append(
							'<option value="' +
								data.result[i].id +
								'" ' +
								($_GET("folder_id") === data.result[i].id
									? "selected"
									: "") +
								">" +
								data.result[i].name +
								"</option>"
						);
					}
				}
			},
			function (xhr) {
				console.log(xhr);
			}
		);
	},
	rename: function ($e) {
		swal(
			{
				title: "Rename File/Folder",
				type: "input",
				inputValue: $e.data("name"),
				showLoaderOnConfirm: true,
				showCancelButton: true,
				closeOnConfirm: false,
				cancelButtonClass: "btn-secondary",
				confirmButtonClass: "btn-success",
				inputPlaceholder: "File/Folder Name",
				confirmButtonText: "Update",
			},
			function (name) {
				if (name === false) return false;
				if (name.trim() === "") {
					swal.showInputError("You need to write something!");
					return false;
				}
				$.ajax({
					url: gdrive_files.url,
					method: "POST",
					dataType: "json",
					data:
						"action=renameFileFolder&name=" +
						name +
						"&id=" +
						$e.data("id") +
						"&email=" +
						$("select#email").val(),
					success: function (res) {
						if (res.status !== "fail") {
							gdrive_files.reload();
							swalSuccess(res.message);
						} else {
							swalError(res.message);
						}
					},
					error: function (xhr) {
						swalError(xhr.responseText);
					},
				});
			}
		);
	},
};
var gdrive_backup_files = {
	url: adminURL + "ajax/gdrive-backup-files/",
	reload: function () {
		$("#ckAllGDBF, #ckAllGDBF1").prop("checked", false);
		$(".toolbar .btn-hidden").addClass("d-none");
		$("#tbGDBackupFiles").DataTable().ajax.reload(null, false);
	},
	list: function () {
		if ($("#tbGDBackupFiles").length) {
			$("#tbGDBackupFiles").DataTable({
				ajax: adminURL + "ajax/gdrive-backup-files-list/",
				serverSide: true,
				columns: [
					{
						data: "id",
						responsivePriority: 0,
						className: "text-center",
						render: function (value) {
							return btnCheckbox(
								value,
								"backup",
								"#tbGDBackupFiles"
							);
						},
					},
					{
						data: "gdrive_id",
						responsivePriority: 1,
						render: function (value) {
							return gdriveViewLink(value);
						},
					},
					{
						data: "mirror_id",
						responsivePriority: 2,
						render: function (value) {
							return gdriveViewLink(value);
						},
					},
					{
						data: "mirror_email",
					},
					{
						data: "added",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "id",
						className: "text-center",
						responsivePriority: 3,
						render: function (value, type, row) {
							return (
								'<button data-id="' +
								value +
								'" data-name="' +
								row.mirror_id +
								'" data-toggle="tooltip" title="Delete" type="button" class="btn btn-danger btn-sm delete"><i class="fas fa-trash-alt"></i></button>'
							);
						},
					},
				],
				columnDefs: [
					{
						orderable: false,
						targets: [0, 5],
					},
					{
						visible: true,
						targets: [0, 3, 4],
						className: "noVis",
					},
				],
				order: [[4, "desc"]],
				drawCallback: function () {
					loadTooltip();
					$("#tbGDBackupFiles button.delete").click(function () {
						gdrive_backup_files.delete.single($(this));
					});
				},
			});
		}
	},
	delete: {
		ajax: function (id, sCallback, eCallback) {
			ajaxPOST(
				gdrive_backup_files.url,
				{
					id: id,
					action: "delete",
				},
				sCallback,
				eCallback
			);
		},
		single: function ($e) {
			swalQuestion(
				"Are you sure?",
				"Delete backup file '" +
					$e.data("name") +
					"'. " +
					notRecovered(),
				function (isConfirm) {
					if (!isConfirm) return;
					gdrive_backup_files.delete.ajax(
						$e.data("id"),
						function (res) {
							if (res.status !== "fail") {
								gdrive_backup_files.reload();
								swalSuccess(res.message);
							} else {
								swalError(res.message);
							}
						},
						function (xhr) {
							swalError(xhr.responseText);
						}
					);
				}
			);
		},
		multi: function () {
			var ids = [],
				deleted = [],
				failed = [];
			$("#ckAllGDBF, #ckAllGDBF1").prop("checked", false);
			$("#tbGDBackupFiles tbody input[type=checkbox]:checked").each(
				function () {
					ids.push($(this).val());
				}
			);
			if (ids.length > 0) {
				var callback = function (res, currentIndex) {
						var nextIndex = currentIndex + 1,
							total = 0;
						if (res.status !== "fail") {
							deleted.push(ids[currentIndex]);
						} else {
							failed.push(ids[currentIndex]);
						}
						total = deleted.length + failed.length;
						if (total >= ids.length) {
							gdrive_backup_files.reload();
							if (failed.length > 0) {
								swalInfo(
									deleted.length +
										" backup files were successfully deleted and " +
										failed.length +
										" other backup files failed to be deleted."
								);
							} else {
								swalSuccess(
									"These " +
										total +
										" backup files have been successfully deleted."
								);
							}
						} else {
							deleteNow(ids[nextIndex], nextIndex);
						}
					},
					deleteNow = function (id, currentIndex) {
						gdrive_backup_files.delete.ajax(
							id,
							function (res) {
								callback(res, currentIndex);
							},
							function (xhr) {
								callback({ status: "fail" }, currentIndex);
							}
						);
					};
				swalQuestion(
					"Are you sure?",
					"You will delete " +
						ids.length +
						" backup files. " +
						notRecovered(),
					function (isConfirm) {
						if (!isConfirm) return;
						deleteNow(ids[0], 0);
					}
				);
			} else {
				swalWarning(
					"Please check the backup files you want to delete first."
				);
			}
		},
	},
};
var gdrive_backup_queue = {
	url: adminURL + "ajax/gdrive-backup-queue/",
	reload: function () {
		$("#ckAllGDQF, #ckAllGDQF1").prop("checked", false);
		$(".toolbar .btn-hidden").addClass("d-none");
		$("#tbGDBackupQueue").DataTable().ajax.reload(null, false);
	},
	list: function () {
		if ($("#tbGDBackupQueue").length) {
			$("#tbGDBackupQueue").DataTable({
				ajax: adminURL + "ajax/gdrive-backup-queue-list/",
				serverSide: true,
				columns: [
					{
						data: "id",
						className: "text-center",
						responsivePriority: 2,
						render: function (value) {
							return btnCheckbox(
								value,
								"queue",
								"#tbGDBackupQueue"
							);
						},
					},
					{
						data: "gdrive_id",
						responsivePriority: 0,
						render: function (value) {
							return gdriveViewLink(value);
						},
					},
					{
						data: "id",
						className: "text-center",
						responsivePriority: 1,
						render: function (value, type, row) {
							return (
								'<button data-id="' +
								row.gdrive_id +
								'" data-toggle="tooltip" title="Copy File" type="button" class="btn btn-primary btn-sm copy-file"><i class="fas fa-copy"></i></button>&nbsp;<button data-id="' +
								value +
								'" data-name="' +
								row.gdrive_id +
								'" data-toggle="tooltip" title="Delete" type="button" class="btn btn-danger btn-sm delete"><i class="fas fa-trash-alt"></i></button>'
							);
						},
					},
				],
				columnDefs: [
					{
						orderable: false,
						targets: [0, 2],
					},
					{
						visible: true,
						targets: [0, 1],
						className: "noVis",
					},
				],
				drawCallback: function () {
					loadTooltip();
					$("#tbGDBackupQueue button.delete").click(function () {
						gdrive_backup_queue.delete.single($(this));
					});
					$("#tbGDBackupQueue button.copy-file").click(function () {
						$(this).prop("disabled", true);
						gdrive_backup_queue.copy($(this));
					});
				},
			});
		}
	},
	copy: function ($e) {
		ajaxPOST(
			gdrive_backup_queue.url,
			{
				id: $e.data("id"),
				action: "copy",
			},
			function (res) {
				if (res.status !== "fail") {
					gdrive_backup_queue.reload();
					swalSuccess(res.message);
				} else {
					$e.prop("disabled", false);
					swalError(res.message);
				}
			},
			function (xhr) {
				$e.prop("disabled", false);
				swalError(xhr.responseText);
			}
		);
	},
	delete: {
		ajax: function (id, sCallback, eCallback) {
			ajaxPOST(
				gdrive_backup_queue.url,
				{
					id: id,
					action: "delete",
				},
				sCallback,
				eCallback
			);
		},
		single: function ($e) {
			swalQuestion(
				"Are you sure?",
				"Delete backup queue '" +
					$e.data("name") +
					"'. " +
					notRecovered(),
				function (isConfirm) {
					if (!isConfirm) return;
					gdrive_backup_queue.delete.ajax(
						$e.data("id"),
						function (res) {
							if (res.status !== "fail") {
								gdrive_backup_queue.reload();
								swalSuccess(res.message);
							} else {
								swalError(res.message);
							}
						},
						function (xhr) {
							swalError(xhr.responseText);
						}
					);
				}
			);
		},
		multi: function () {
			var ids = [],
				deleted = [],
				failed = [];
			$("#ckAllGDQF, #ckAllGDQF1").prop("checked", false);
			$("#tbGDBackupQueue tbody input[type=checkbox]:checked").each(
				function () {
					ids.push($(this).val());
				}
			);
			if (ids.length > 0) {
				var callback = function (res, currentIndex) {
						var nextIndex = currentIndex + 1,
							total = 0;
						if (res.status !== "fail") {
							deleted.push(ids[currentIndex]);
						} else {
							failed.push(ids[currentIndex]);
						}
						total = deleted.length + failed.length;
						if (total >= ids.length) {
							gdrive_backup_queue.reload();
							if (failed.length > 0) {
								swalInfo(
									deleted.length +
										" backup queue were successfully deleted and " +
										failed.length +
										" other backup queue failed to be deleted."
								);
							} else {
								swalSuccess(
									"These " +
										total +
										" backup queue have been successfully deleted."
								);
							}
						} else {
							deleteNow(ids[nextIndex], nextIndex);
						}
					},
					deleteNow = function (id, currentIndex) {
						gdrive_backup_queue.delete.ajax(
							id,
							function (res) {
								callback(res, currentIndex);
							},
							function (xhr) {
								callback({ status: "fail" }, currentIndex);
							}
						);
					};
				swalQuestion(
					"Are you sure?",
					"You will delete " +
						ids.length +
						" backup queue. " +
						notRecovered(),
					function (isConfirm) {
						if (!isConfirm) return;
						deleteNow(ids[0], 0);
					}
				);
			} else {
				swalWarning(
					"Please check the backup files you want to delete first."
				);
			}
		},
	},
};
var load_balancers = {
	url: adminURL + "ajax/load-balancers/",
	reload: function () {
		$("#tbLoadBalancers").DataTable().ajax.reload(null, false);
	},
	delete: function ($e) {
		swalQuestion(
			"Are you sure?",
			"Delete the '" + $e.data("name") + "' server. " + notRecovered(),
			function (isConfirm) {
				if (!isConfirm) return;
				ajaxPOST(
					load_balancers.url,
					{
						id: $e.data("id"),
						action: "delete",
					},
					function (res) {
						if (res.status !== "fail") {
							load_balancers.reload();
							swalSuccess(res.message);
						} else {
							swalError(res.message);
						}
					},
					function (xhr) {
						swalError(xhr.responseText);
					}
				);
			}
		);
	},
	update_status: function ($e) {
		ajaxPOST(
			load_balancers.url,
			{
				id: $e.data("id"),
				status: $e.data("status"),
				action: "updateStatus",
			},
			function (res) {
				if (res.status !== "fail") {
					load_balancers.reload();
					swalSuccess(res.message);
				} else {
					swalError(res.message);
				}
			},
			function (xhr) {
				swalError(xhr.responseText);
			}
		);
	},
	list: function () {
		if ($("#tbLoadBalancers").length) {
			$("#tbLoadBalancers").DataTable({
				ajax: adminURL + "ajax/load-balancers-list/",
				serverSide: true,
				columns: [
					{
						data: "name",
						responsivePriority: 0,
					},
					{
						data: "link",
						responsivePriority: 1,
						render: function (value, type, row, meta) {
							return (
								'<a href="' +
								value +
								'" target="_blank">' +
								value +
								"</a>"
							);
						},
					},
					{
						data: "connections",
						className: "text-right",
					},
					{
						data: "playbacks",
						className: "text-right",
					},
					{
						data: "status",
						className: "text-center",
						render: function (value, type, row, meta) {
							var icon = "fa-check-circle text-success",
								title = "Disable";
							if (value == 0) {
								icon = "fa-times-circle text-danger";
								title = "Enable";
								value = 1;
							} else {
								value = 0;
							}
							return (
								'<a href="javascript:void(0)" class="status" data-id="' +
								row.id +
								'" data-status="' +
								value +
								'" data-toggle="tooltip" title="' +
								title +
								'"><i class="fas fa-lg ' +
								icon +
								'"></i></a>'
							);
						},
					},
					{
						data: "added",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "updated",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "id",
						className: "text-center",
						responsivePriority: 2,
						render: function (value, type, row) {
							return (
								'<div class=""dropdown"">' +
								btnCog() +
								'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
								btnEditItem(
									adminURL +
										"settings/load-balancers/edit/?id=" +
										value
								) +
								btnDeleteItem(value, row.name) +
								'<button type="button" class="dropdown-item clear" data-id="' +
								value +
								'" data-url="' +
								row.link +
								'ajax/admin-api/"><i class="fas fa-refresh mr-2 me-2"></i>Clear Cache</button></div></div>'
							);
						},
					},
				],
				columnDefs: [
					{
						orderable: false,
						targets: [7],
					},
					{
						visible: true,
						targets: [1, 2, 3, 4, 5],
						className: "noVis",
					},
				],
				order: [[5, "desc"]],
				drawCallback: function () {
					loadTooltip();
					$("a.status").click(function () {
						load_balancers.update_status($(this));
					});
					$("#tbLoadBalancers button.clear").click(function () {
						load_balancers.clear($(this));
					});
					$("#tbLoadBalancers button.delete").click(function () {
						load_balancers.delete($(this));
					});
				},
			});
		}
	},
	clear: function ($e) {
		ajaxPOST(
			$e.data("url"),
			{
				id: $e.data("id"),
				action: "clearLoadBalancer",
				token: Cookies.get("adv_token", main.cookieConfig),
			},
			function (res) {
				if (res.status !== "fail") {
					swalSuccess(res.message);
				} else {
					swalError(res.message);
				}
			},
			function (xhr) {
				swalError(xhr.responseText);
			}
		);
	},
	resetHost: function () {
		$("#resetLBHost").prop("disabled", true);
		ajaxPOST(
			settings.url,
			{
				action: "resetHosts",
			},
			function (data) {
				$("#resetLBHost").prop("disabled", false);
				if (data.status !== "fail") {
					$("#bypass_hosts").find("option").removeAttr("selected");
					$("#bypass_hosts").multiSelect("select", data.result);
					$("#bypass_hosts").multiSelect("refresh");
					swalSuccess(data.message);
				} else {
					swalError(data.message);
				}
			},
			function (xhr) {
				swalError(xhr.responseText);
			}
		);
	},
};
var settings = {
	url: adminURL + "ajax/settings/",
	disableBlacklistedVideos: function ($e) {
		swalQuestion(
			"Are you sure?",
			"You will disable videos with titles containing blacklisted words.",
			function (isConfirm) {
				if (!isConfirm) return;
				$e.prop("disabled", true);
				ajaxPOST(
					settings.url,
					{
						action: "disableBlacklistedVideos",
					},
					function (res) {
						if (res.status !== "fail") {
							$("#word_blacklisted").val(res.result);
							swalSuccess(res.message);
						} else {
							swalSuccess(res.message);
						}
						$e.prop("disabled", false);
					},
					function (xhr) {
						swalError(res.responseText);
						$e.prop("disabled", false);
					}
				);
			}
		);
	},
	smtp: function () {
		var pv = $("#smtp_provider").val();
		var $host = $("#smtp_host"),
			$port = $("#smtp_port"),
			$tls = $("#smtp_tls");
		var provider = {
			gmail: {
				host: "smtp.gmail.com",
				port: 465,
				tls: false,
			},
			ymail: {
				host: "smtp.mail.yahoo.com",
				port: 587,
				tls: true,
			},
			outlook: {
				host: "smtp.office365.com",
				port: 587,
				tls: true,
			},
		};
		var selected = {};
		if (pv !== "other") {
			selected = provider[pv];
			$host.val(selected.host);
			$port.val(selected.port);
			$tls.prop("checked", true);
		} else {
			$host.val("");
			$port.val("");
			$tls.prop("checked", false);
		}
	},
	vast: {
		remove: function (index) {
			$("#vastWrapper .form-group[data-index=" + index + "]").remove();
		},
		add: function () {
			var $wrap = $("#vastWrapper");
			var index = $wrap.find(".form-group").length;
			$wrap.append(
				'<div class="form-group" data-index="' +
					index +
					'"><div class="input-group"><div class="input-group-prepend" style="max-width:110px"><input type="text" placeholder="Ad Position" name="vast_offset[]" id="vast_offset-' +
					index +
					'" class="form-control"></div><input type="url" name="vast_xml[]" id="vast_xml-' +
					index +
					'" placeholder="VAST URL (.xml)" class="form-control"><div class="input-group-append"><button type="button" class="btn btn-danger" onclick="settings.vast.remove(' +
					index +
					')" data-toggle="tooltip" title="Remove VAST"><i class="fas fa-minus"></i></button></div></div></div>'
			);
			loadTooltip();
		},
		delete: function ($e) {
			ajaxPOST(
				settings.url,
				{
					action: "deleteCustomVAST",
					file_name: $e.data("id"),
				},
				function (res) {
					if (res.status !== "fail") {
						swalSuccess(res.message);
					} else {
						swalError(res.message);
					}
					$e.closest("li").remove();
				},
				function (xhr) {
					swalError(xhr.responseText);
				}
			);
		},
	},
	changeCache: function ($e) {
		var $instance = $e.find('option[value="files"]');
		ajaxPOST(
			settings.url,
			{
				action: "extensionChecker",
				extension: $e.val(),
			},
			function (res) {
				if (res.status === "fail") {
					$instance.prop("selected", true);
					swalError(res.message);
				}
			},
			function (xhr) {
				swalError(xhr.responseText);
				$instance.prop("selected", true);
			}
		);
	},
	checkProxy: function () {
		var $btn = $("#checkProxy"),
			oText = $btn.html(),
			hosts = [
				"proxy_docker_com",
				"free_proxy_cz",
				"free_proxy_list_net",
			],
			success = [],
			failed = [],
			completed = function () {
				if (success.length + failed.length >= hosts.length) {
					$btn.html(oText).prop("disabled", false);
					swalSuccess(
						"The proxy list has been successfully updated."
					);
				}
			},
			proxyChecker = function (v) {
				ajaxGET(
					baseURL + "cron-proxy/?host=" + v,
					function (data) {
						if (data.status !== "fail") {
							success.push(v);
							$("#proxy_list").val(data.result);
						} else {
							failed.push(v);
						}
						completed();
					},
					function (xhr) {
						failed.push(v);
						completed();
					}
				);
			};

		$btn.html(oText + '<i class="fas fa-spin fa-sync-alt ml-2 ms-2"></i>').prop(
			"disabled",
			true
		);
		if ($("#proxy_list").val() !== "") {
			ajaxGET(
				baseURL + "cron-proxy/",
				function (data) {
					if (data.status !== "fail") {
						swalSuccess(data.message);
					} else {
						swalError(data.message);
					}
					$btn.html(oText).prop("disabled", false);
				},
				function (xhr) {
					swalError(xhr.responseText);
					$btn.html(oText).prop("disabled", false);
				}
			);
		} else {
			$.each(hosts, function (i, v) {
				proxyChecker(v);
			});
		}
	},
	clearCache: {
		cleared: 0,
		failed: 0,
		total: 0,
		callback: function (xhr) {
			var cache = settings.clearCache;
			if (xhr.status !== "fail") {
				cache.cleared += 1;
			} else {
				cache.failed += 1;
			}
			if (cache.cleared + cache.failed >= cache.total) {
				if (cache.failed > 0 && cache.cleared === 0) {
					swalError(
						"The cache failed to clear or the cache does not exist."
					);
				} else {
					swalSuccess("The cache has been successfully cleared.");
				}
				$("#clearCache").prop("disabled", false);
			}
		},
		prompt: function (msgText, action) {
			var lbs = localStorage.getItem("lb"),
				lb = typeof lbs === "string" ? JSON.parse(lbs) : [baseURL],
				callback = settings.clearCache.callback,
				data = {
					action: action,
					token: Cookies.get("adv_token", main.cookieConfig),
				};
			if (lb.length > 0) {
				swalQuestion("Are you sure!", msgText, function (isConfirm) {
					if (!isConfirm) return;
					$("#clearCache").prop("disabled", true);
					$.each(lb, function (i, v) {
                        if (i === lb.length - 1) {
                            ajaxPOST(v + "ajax/settings/", data, callback, callback);
                        } else {
                            ajaxPOST(v + "ajax/settings/", data);
                        }
					});
				});
			}
		},
		all: function () {
			settings.clearCache.prompt(
				"You will clear all cache.",
				"clearAllCache"
			);
		},
		videosFiles: function () {
			settings.clearCache.prompt(
				"You will clear all video cache files.",
				"clearVideosFiles"
			);
		},
		videos: function () {
			settings.clearCache.prompt(
				"You will clear all videos cache.",
				"clearVideosCache"
			);
		},
		settings: function () {
			settings.clearCache.prompt(
				"You will clear all settings cache.",
				"clearSettingsCache"
			);
		},
	},
	resetHost: function () {
		var oText = $("#resetHost").html();
		swalQuestion(
			"Are you sure?",
			"Return the hosts to their original position. Then clear the settings cache.",
			function (isConfirm) {
				if (!isConfirm) return;
				$("#resetHost")
					.html(
						oText + '<i class="fas fa-spin fa-sync-alt ml-2 ms-2"></i>'
					)
					.prop("disabled", true);
				ajaxPOST(
					settings.url,
					{
						action: "resetHosts",
					},
					function (data) {
						$("#resetHost").html(oText).prop("disabled", false);
						if (data.status !== "fail") {
							$("#bypass_host")
								.find("option")
								.removeAttr("selected");
							$("#bypass_host").multiSelect(
								"select",
								data.result
							);
							$("#bypass_host").multiSelect("refresh");
							swalSuccess(data.message);
						} else {
							swalError(data.message);
						}
					},
					function (xhr) {
						swalError(xhr.responseText);
					}
				);
			}
		);
	},
};
var subtitles = {
	url: adminURL + "ajax/subtitles/",
	loadHosts: function () {
		ajaxPOST(
			subtitles.url,
			{
				action: "getHosts",
			},
			function (res) {
				if (res.status !== "fail") {
					var html = "",
						$old = $("#oldLocation"),
						i = 0;
					$old.html("");
					for (i in res.result) {
						html +=
							'<option value="' +
							res.result[i] +
							'">' +
							res.result[i] +
							"</option>";
					}
					$old.html(html);
				}
			},
			function (xhr) {
				swalError(xhr.responseText);
			}
		);
	},
	html: function (name) {
		var html = '<select name="' + name + '" class="form-control select2">';
		$.each(languages, function (i, v) {
			html += '<option value="' + v + '">' + v + "</option>";
		});
		return html + "</select>";
	},
	migrate: function () {
		subtitles.loadHosts();
		$("#modalHostSub").modal("show");
		$("#frmMigrateSub").on("submit", function (e) {
			e.preventDefault();
			e.stopPropagation();

			var $btn = $(this).find('button[type="submit"]');
			if (this.checkValidity() === false || $btn.prop("disabled")) {
				$(this).addClass("was-validated");
				return;
			}

			$.ajax({
				type: "POST",
				url: subtitles.url,
				cache: false,
				data: $(this).serialize(),
				beforeSend: function () {
					$btn.prop("disabled", true);
				},
				complete: function () {
					$btn.prop("disabled", false);
				},
				success: function (res) {
					if (res.status !== "fail") {
						subtitles.reload();
						showToast(res.message, "success");
						$("#frmMigrateSub").get(0).reset();
					} else {
						showToast(res.message, "error");
					}
				},
				error: function () {
					showToast(
						"Server cannot be accessed. Please contact admin!",
						"error"
					);
				},
			});
		});
	},
	rename: function ($e) {
		swal(
			{
				title: "Rename",
				type: "input",
				inputValue: $e.data("name"),
				showLoaderOnConfirm: true,
				showCancelButton: true,
				closeOnConfirm: false,
				cancelButtonClass: "btn-secondary",
				confirmButtonClass: "btn-success",
				inputPlaceholder: "File Name",
				confirmButtonText: "Save",
			},
			function (value) {
				if (value === false) return false;
				if (value.trim() === "") {
					swal.showInputError("You need to write something!");
					return false;
				}
				ajaxPOST(
					subtitles.url,
					{
						action: "rename",
						name: value,
						id: $e.data("id"),
					},
					function (res) {
						if (res.status !== "fail") {
							subtitles.reload();
							swalSuccess(res.message);
						} else {
							swalError(res.message);
						}
					},
					function (xhr) {
						swalError(xhr.responseText);
					}
				);
			}
		);
	},
	delete: {
		ajax: function (id, sCallback, eCallback) {
			ajaxPOST(
				subtitles.url,
				{
					action: "delete",
					id: id,
				},
				sCallback,
				eCallback
			);
		},
		single: function ($e) {
			swalQuestion(
				"Are you sure?",
				"Delete the '" +
					$e.data("name") +
					"' subtitle file. " +
					notRecovered(),
				function (isConfirm) {
					if (!isConfirm) return;
					subtitles.delete.ajax(
						$e.data("id"),
						function (res) {
							if (res.status !== "fail") {
								subtitles.reload();
								swalSuccess(res.message);
							} else {
								swalError(res.message);
							}
						},
						function (xhr) {
							swalError(xhr.responseText);
						}
					);
				}
			);
		},
		multi: function () {
			var ids = [],
				deleted = [],
				failed = [];
			$("#ckAllSubtitles, #ckAllSubtitles1").prop("checked", false);
			$("#tbSubtitles tbody input[type=checkbox]:checked").each(
				function () {
					ids.push($(this).val());
				}
			);
			if (ids.length > 0) {
				var callback = function (res, currentIndex) {
						var nextIndex = currentIndex + 1,
							total = 0;
						if (res.status !== "fail") {
							deleted.push(ids[currentIndex]);
						} else {
							failed.push(ids[currentIndex]);
						}
						total = deleted.length + failed.length;
						if (total >= ids.length) {
							subtitles.reload();
							if (failed.length > 0) {
								swalInfo(
									"The " +
										deleted.length +
										" subtitle files have been successfully deleted and the other " +
										failed.length +
										" subtitle files failed to be deleted."
								);
							} else {
								swalSuccess(
									"The " +
										total +
										" subtitle files have been successfully deleted."
								);
							}
						} else {
							deleteNow(ids[nextIndex], nextIndex);
						}
					},
					deleteNow = function (id, currentIndex) {
						subtitles.delete.ajax(
							id,
							function (res) {
								callback(res, currentIndex);
							},
							function (xhr) {
								callback({ status: "fail" }, currentIndex);
							}
						);
					};
				swalQuestion(
					"Are you sure?",
					"You will delete " +
						ids.length +
						" subtitle files. " +
						notRecovered(),
					function (isConfirm) {
						if (!isConfirm) return;
						deleteNow(ids[0], 0);
					}
				);
			} else {
				swalWarning(
					"Please check the subtitle files you want to delete first."
				);
			}
		},
	},
	list: function () {
		if ($("#tbSubtitles").length) {
			$("#tbSubtitles").DataTable({
				ajax: adminURL + "ajax/subtitles-list/",
				serverSide: true,
				columns: [
					{
						data: "DT_RowId",
						responsivePriority: 0,
						className: "text-center",
						render: function (value, type, row, meta) {
							return btnCheckbox(
								value,
								"subtitle",
								"#tbSubtitles"
							);
						},
					},
					{
						data: "file_name",
						responsivePriority: 1,
						render: function (value, type, row, meta) {
							return (
								'<a href="' + row.link + '">' + value + "</a>"
							);
						},
					},
					{
						data: "language",
						className: "text-center",
					},
					{
						data: "name",
					},
					{
						data: "host",
					},
					{
						data: "added",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "updated",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "id",
						className: "text-center",
						responsivePriority: 2,
						render: function (value, type, row) {
							return (
								'<div class=""dropdown"">' +
								btnCog() +
								'<div class="dropdown-menu dropdown-menu-right border-0 shadow"><button type="button" class="dropdown-item rename" data-id="' +
								value +
								'" data-name="' +
								row.file_name +
								'"><i class="fas fa-edit mr-2 me-2"></i>Rename</button><a href="' +
								row.link +
								'" class="dropdown-item" download><i class="fas fa-download mr-2 me-2"></i>Download</a>' +
								btnDeleteItem(value, row.file_name) +
								"</div></div>"
							);
						},
					},
				],
				columnDefs: [
					{
						orderable: false,
						targets: [0, 7],
					},
					{
						visible: true,
						targets: [0, 1, 7],
						className: "noVis",
					},
				],
				order: [[6, "desc"]],
				drawCallback: function () {
					loadTooltip();
					$("#tbSubtitles button.delete").click(function () {
						subtitles.delete.single($(this));
					});
					$("#tbSubtitles button.rename").click(function () {
						subtitles.rename($(this));
					});
				},
			});
		}
	},
	reload: function () {
		$("#ckAllSubtitles, #ckAllSubtitles1").prop("checked", false);
		$(".toolbar .btn-hidden").addClass("d-none");
		$("#tbSubtitles").DataTable().ajax.reload(null, false);
	},
	upload: function () {
		$("#mdUploadSubtitle").modal("show");
		$("#frmUploadSubtitle").on("submit", function (e) {
			e.preventDefault();
			e.stopPropagation();
			var data = new FormData(this),
				$frm = $("#frmUploadSubtitle"),
				$file = $frm.find('input[type="file"]'),
				$btn = $(this).find('button[type="submit"]');

			if (this.checkValidity() === false || $btn.prop("disabled")) {
				$(this).addClass("was-validated");
				return;
			}
			if (document.getElementById("uploadSubFile").files.length > 0) {
				$.ajax({
					type: "POST",
					url: subtitles.url,
					contentType: false,
					processData: false,
					cache: false,
					data: data,
					beforeSend: function () {
						$btn.prop("disabled", true);
					},
					complete: function () {
						$btn.prop("disabled", false);
						$file.val("");
						$frm.find('label[for="uploadSubFile"]').text(
							$file.attr("placeholder")
						);
					},
					success: function (res) {
						if (res.status !== "fail") {
							subtitles.reload();
							showToast(res.message, "success");
						} else {
							showToast(res.message, "error");
						}
					},
					error: function () {
						showToast(
							"Server cannot be accessed. Please contact admin!",
							"error"
						);
					},
				});
			} else {
				showToast("Insert the Subtitle File first!", "error");
			}
		});
	},
};
var sessions = {
	url: adminURL + "ajax/sessions/",
	delete: {
		ajax: function (id, sCallback, eCallback) {
			ajaxPOST(
				sessions.url,
				{
					id: id,
					action: "delete",
				},
				sCallback,
				eCallback
			);
		},
		single: function ($e) {
			swalQuestion(
				"Are you sure?",
				"Delete '" + $e.data("name") + "' session. " + notRecovered(),
				function (isConfirm) {
					if (!isConfirm) return;
					sessions.delete.ajax(
						$e.data("id"),
						function (res) {
							if (res.status !== "fail") {
								sessions.reload();
								swalSuccess(res.message);
							} else {
								swalError(res.message);
							}
						},
						function (xhr) {
							swalError(xhr.responseText);
						}
					);
				}
			);
		},
		multi: function () {
			var ids = [],
				deleted = [],
				failed = [];
			$("#ckAllSessions, #ckAllSessions1").prop("checked", false);
			$("#tbSessions tbody input[type=checkbox]:checked").each(
				function () {
					ids.push($(this).val());
				}
			);
			if (ids.length > 0) {
				var callback = function (res, currentIndex) {
						var nextIndex = currentIndex + 1,
							total = 0;
						if (res.status !== "fail") {
							deleted.push(ids[currentIndex]);
						} else {
							failed.push(ids[currentIndex]);
						}
						total = deleted.length + failed.length;
						if (total >= ids.length) {
							sessions.reload();
							if (failed.length > 0) {
								swalInfo(
									deleted.length +
										" user sessions were successfully deleted and " +
										failed.length +
										" other user sessions failed to be deleted."
								);
							} else {
								swalSuccess(
									"These " +
										total +
										" user sessions have been successfully deleted."
								);
							}
						} else {
							deleteNow(ids[nextIndex], nextIndex);
						}
					},
					deleteNow = function (id, currentIndex) {
						sessions.delete.ajax(
							id,
							function (res) {
								callback(res, currentIndex);
							},
							function (xhr) {
								callback({ status: "fail" }, currentIndex);
							}
						);
					};
				swalQuestion(
					"Are you sure?",
					"You will delete " +
						ids.length +
						" user sessions. " +
						notRecovered(),
					function (isConfirm) {
						if (!isConfirm) return;
						deleteNow(ids[0], 0);
					}
				);
			} else {
				swalWarning(
					"Please check the user sessions you want to delete first."
				);
			}
		},
	},
	list: function () {
		if ($("#tbSessions").length) {
			$("#tbSessions").DataTable({
				ajax: adminURL + "ajax/sessions-list/",
				serverSide: true,
				columns: [
					{
						data: "id",
						responsivePriority: 0,
						className: "text-center",
						render: function (value) {
							return btnCheckbox(value, "session", "#tbSessions");
						},
					},
					{
						data: "username",
						responsivePriority: 1,
					},
					{
						data: "ip",
						responsivePriority: 2,
					},
					{
						data: "useragent",
						render: function (value) {
							return (
								'<div contentEditable="plaintext-only" class="title">' +
								value +
								"</div>"
							);
						},
					},
					{
						data: "created",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "expired",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "id",
						className: "text-center",
						responsivePriority: 3,
						render: function (value, type, row) {
							return (
								'<button data-id="' +
								value +
								'" data-name="' +
								row.username +
								'" data-toggle="tooltip" title="Delete" type="button" class="btn btn-danger btn-sm delete"><i class="fas fa-trash"></i></button>'
							);
						},
					},
				],
				columnDefs: [
					{
						orderable: false,
						targets: [0, 6],
					},
					{
						visible: true,
						targets: [0, 1, 2],
						className: "noVis",
					},
				],
				order: [[5, "desc"]],
				drawCallback: function () {
					loadTooltip();
					$("#tbSessions button.delete").click(function () {
						sessions.delete.single($(this));
					});
				},
			});
		}
	},
	reload: function () {
		$("#ckAllSessions, #ckAllSessions1").prop("checked", false);
		$(".toolbar .btn-hidden").addClass("d-none");
		$("#tbSessions").DataTable().ajax.reload(null, false);
	},
};
var users = {
	url: adminURL + "ajax/users/",
	profileURL: adminURL + "ajax/profile/",
	delete: function ($e) {
		swalQuestion(
			"Are you sure?",
			"Delete the user with the username '" +
				$e.data("name") +
				"'. " +
				notRecovered(),
			function (isConfirm) {
				if (!isConfirm) return;
				ajaxPOST(
					users.url,
					{
						id: $e.data("id"),
						action: "delete",
					},
					function (res) {
						if (res.status !== "fail") {
							$("#tbUsers").DataTable().ajax.reload(null, false);
							swalSuccess(res.message);
						} else {
							swalError(res.message);
						}
					},
					function (xhr) {
						swalError(xhr.responseText);
					}
				);
			}
		);
	},
	list: function () {
		if ($("#tbUsers").length) {
			$("#tbUsers").DataTable({
				ajax: adminURL + "ajax/users-list/",
				serverSide: true,
				columns: [
					{
						data: "name",
						responsivePriority: 0,
					},
					{
						data: "user",
					},
					{
						data: "email",
					},
					{
						data: "status",
						className: "text-center",
						render: function (value, type, row) {
							var title = "Inactive",
								icon = "fa-times-circle text-danger";
							if (value == 1) {
								title = "Active";
								icon = "fa-check-circle text-success";
							} else if (value == 2) {
								title = "Need Approval";
								icon = "fa-question-circle text-info";
							}
							return (
								'<i class="fas fa-lg ' +
								icon +
								'" data-toggle="tooltip" title="' +
								title +
								'"></i>'
							);
						},
					},
					{
						data: "added",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "updated",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "role",
					},
					{
						data: "videos",
						className: "text-right",
					},
					{
						data: "id",
						className: "text-center",
						responsivePriority: 1,
						render: function (value, type, row) {
							return (
								'<div class=""dropdown"">' +
								btnCog() +
								'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
								btnEditItem(
									adminURL + "users/edit/?id=" + value
								) +
								btnDeleteItem(row.id, row.name) +
								'<button class="dropdown-item showStat" data-id="' +
								value +
								'" type="button"><i class="fas fa-chart-line mr-2 me-2"></i>Statistics</button></div></div>'
							);
						},
					},
				],
				columnDefs: [
					{
						orderable: false,
						targets: [8],
					},
					{
						visible: true,
						targets: [0, 8],
						className: "noVis",
					},
				],
				order: [[4, "desc"]],
				drawCallback: function () {
					loadTooltip();
					$("#tbUsers button.delete").click(function () {
						users.delete($(this));
					});
					$("#tbUsers button.showStat").click(function () {
						var $st = $("#modalUserStats");
						$st.modal("show");
						$st.find("#statUserID").val($(this).data("id"));
					});
				},
			});
		}
	},
	changeEmail: function (email) {
		if (typeof email !== "undefined" && email !== "") {
			ajaxPOST(
				users.profileURL,
				{
					action: "editEmail",
					email: email,
				},
				function (res) {
					if (res.status !== "fail") {
						swalSuccess(res.message);
						location.href = adminURL + "login/";
					} else {
						swalError(res.message);
					}
				},
				function (xhr) {
					swalError(xhr.responseText);
				}
			);
		}
	},
	changeUsername: function (user) {
		if (typeof user !== "undefined" && user !== "") {
			ajaxPOST(
				users.profileURL,
				{
					action: "editUsername",
					user: user,
				},
				function (res) {
					if (res.status !== "fail") {
						swalSuccess(res.message);
						location.href = adminURL + "login/";
					} else {
						swalError(res.message);
					}
				},
				function (xhr) {
					swalError(xhr.responseText);
				}
			);
		}
	},
	stats: {
		videosStatus: function (uid) {
			if (typeof uid !== undefined) {
				ajaxPOST(
					dashboard.ajaxURL,
					{
						action: "videosStatus",
						uid: uid,
					},
					function (res) {
						if (res.status !== "fail") {
							$("#numUserVideos").text(res.result.total_videos);
							$("#numUserBrokenVideos").text(res.result.broken);
						}
					}
				);
			}
		},
		recentVideos: function (uid) {
			if ($("#tbUserRecentVideos").length && typeof uid !== undefined) {
				$("#tbUserRecentVideos").DataTable({
					ajax: dashboard.videosURL + "?recent=true&uid=" + uid,
					serverSide: true,
					columns: [
						{
							data: "title",
							responsivePriority: 0,
							render: function (value, type, row, meta) {
								if (value === "") value = "(No Title)";
								return (
									'<div class="title" contentEditable="plaintext-only" data-toggle="tooltip" title="' +
									value +
									'">' +
									value +
									"</div>"
								);
							},
						},
						{
							data: "host",
							className: "text-center",
							render: function (value, type, row, meta) {
								if (row.alt_count > 0) {
									return (
										'<div class="dropdown"><button class="btn btn-outline-default btn-sm dropdown-toggle alt" type="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-expanded="false" data-id="' +
										row.id +
										'"><img src="' +
										imgCDNURL +
										"assets/img/logo/" +
										value +
										'.png" width="16" height="16"></button><div class="dropdown-menu shadow border-0" style="max-height:240px"></div></div>'
									);
								} else {
									return (
										'<a href="' +
										row.link +
										'" target="_blank" title="' +
										(typeof vidHosts[value] !== "undefined"
											? vidHosts[value]
											: value
										)
											.replace("|Additional Host", "")
											.replace("|New", "") +
										'" data-toggle="tooltip"><img src="' +
										imgCDNURL +
										"assets/img/logo/" +
										value +
										'.png" width="16" height="16"></a>'
									);
								}
							},
						},
						{
							data: "views",
							className: "text-right",
						},
						{
							data: "added",
							className: "text-right",
							render: function (value, type, row) {
								return formatTimestamp(value);
							},
						},
						{
							data: "id",
							className: "text-center",
							render: function (value, type, row) {
								return (
									'<div class=""dropdown"">' +
									btnCog() +
									'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
									btnCopyEmbed(row.actions.embed_code) +
									btnEmbed(row.actions.embed) +
									btnDownload(row.actions.download) +
									'<div class="dropdown-divider"></div>' +
									btnEditItem(
										adminURL + "videos/edit/?id=" + value
									) +
									'<button data-id="' +
									value +
									'" onclick="videos.cache.clear.single($(this));" class="dropdown-item" type="button"><i class="fas fa-eraser mr-2 me-2"></i>Clear Cache</button></div></div>'
								);
							},
						},
					],
					ordering: false,
					lengthMenu: [7],
					pageLength: 7,
					searching: false,
					bLengthChange: false,
					info: false,
					paging: false,
					columnDefs: [
						{
							orderable: false,
							targets: [0, 1, 2, 3, 4],
						},
						{
							visible: true,
							targets: [0, 1],
							className: "noVis",
						},
					],
					drawCallback: function () {
						loadTooltip();
						$("#tbUserRecentVideos button.alt").click(function () {
							videos.alternatives.get($(this));
						});
						$("#tbUserRecentVideos button.copy-embed").click(
							function () {
								copyText($(this).data("text"), "Embed");
							}
						);
					},
				});
			}
		},
		popularVideos: function (uid) {
			if ($("#tbUserPopularVideos").length && typeof uid !== undefined) {
				$("#tbUserPopularVideos").DataTable({
					ajax: dashboard.videosURL + "?popular=true&uid=" + uid,
					serverSide: true,
					columns: [
						{
							data: "title",
							responsivePriority: 0,
							render: function (value, type, row, meta) {
								if (value === "") value = "(No Title)";
								return (
									'<div class="title" contentEditable="plaintext-only" data-toggle="tooltip" title="' +
									value +
									'">' +
									value +
									"</div>"
								);
							},
						},
						{
							data: "host",
							className: "text-center",
							render: function (value, type, row, meta) {
								if (row.alt_count > 0) {
									return (
										'<div class="dropdown"><button class="btn btn-outline-default btn-sm dropdown-toggle alt" type="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-expanded="false" data-id="' +
										row.id +
										'"><img src="' +
										imgCDNURL +
										"assets/img/logo/" +
										value +
										'.png" width="16" height="16"></button><div class="dropdown-menu shadow border-0" style="max-height:240px"></div></div>'
									);
								} else {
									return (
										'<a href="' +
										row.link +
										'" target="_blank" title="' +
										(typeof vidHosts[value] !== "undefined"
											? vidHosts[value]
											: value
										)
											.replace("|Additional Host", "")
											.replace("|New", "") +
										'" data-toggle="tooltip"><img src="' +
										imgCDNURL +
										"assets/img/logo/" +
										value +
										'.png" width="16" height="16"></a>'
									);
								}
							},
						},
						{
							data: "views",
							className: "text-right",
						},
						{
							data: "added",
							className: "text-right",
							render: function (value, type, row) {
								return formatTimestamp(value);
							},
						},
						{
							data: "id",
							className: "text-center",
							render: function (value, type, row) {
								return (
									'<div class=""dropdown"">' +
									btnCog() +
									'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
									btnCopyEmbed(row.actions.embed_code) +
									btnEmbed(row.actions.embed) +
									btnDownload(row.actions.download) +
									'<div class="dropdown-divider"></div>' +
									btnEditItem(
										adminURL + "videos/edit/?id=" + value
									) +
									'<button data-id="' +
									value +
									'" onclick="videos.cache.clear.single($(this));" class="dropdown-item" type="button"><i class="fas fa-eraser mr-2 me-2"></i>Clear Cache</button></div></div>'
								);
							},
						},
					],
					ordering: false,
					lengthMenu: [7],
					pageLength: 7,
					searching: false,
					bLengthChange: false,
					info: false,
					paging: false,
					columnDefs: [
						{
							orderable: false,
							targets: [0, 1, 2, 3, 4],
						},
						{
							visible: true,
							targets: [0, 1],
							className: "noVis",
						},
					],
					drawCallback: function () {
						loadTooltip();
						$("#tbPopularVideos button.alt").click(function () {
							videos.alternatives.get($(this));
						});
						$("#tbPopularVideos button.copy-embed").click(
							function () {
								copyText($(this).data("text"), "Embed");
							}
						);
					},
				});
			}
		},
	},
};
var videos = {
	url: adminURL + "ajax/videos/",
	importUrl: adminURL + "ajax/videos-import/",
	exportUrl: adminURL + "ajax/videos-export/",
	alternatives: {
		add: function (val) {
			var $wrap = $("#altWrapper");
			var index = $wrap.find(".input-group").length;
			var html =
				'<div class="form-group" data-index="' +
				index +
				'"><div class="input-group"><input type="url" id="altLink-' +
				index +
				'" name="altLinks[]" class="form-control" placeholder="Insert alternative video url here" value="' +
				(typeof val !== "undefined" ? val : "") +
				'"><div class="input-group-append"><button type="button" data-toggle="tooltip" title="Remove Alternative Video URL" class="btn btn-danger" onclick="videos.alternatives.remove(' +
				index +
				')"><i class="fas fa-minus"></i></button><a href="javascript:void(0)" data-toggle="tooltip" title="Move" class="btn btn-outline-secondary move"><i class="fas fa-expand-arrows-alt"></i></a></div></div></div>';
			$wrap.prepend(html);
			loadTooltip();
		},
		remove: function (i) {
			$('#altWrapper .form-group[data-index="' + i + '"]').remove();
			$('body > [role="tooltip"]').remove();
		},
		get: function (e) {
			var d = e.next(".dropdown-menu");
            ajaxPOST(
                videos.url,
                {
                    action: "getAlternatives",
                    id: e.data("id"),
                },
                function (res) {
                    if (res.status !== "fail") {
                        var hostName = "Direct URL",
                            icon = "direct";
                        d.html("");
                        $.each(res.result, function (i, v) {
                            if (
                                v.host !== "" &&
                                typeof vidHosts[v.host] !== "undefined"
                            ) {
                                if (v.host === "direct") {
                                    if (
                                        v.url.indexOf(".m3u") > -1 ||
                                        v.url.indexOf("hls") > -1
                                    ) {
                                        icon = "m3u";
                                        hostName = "HLS URL";
                                    } else if (
                                        v.url.indexOf(".mpd") > -1 ||
                                        v.url.indexOf("mpd") > -1
                                    ) {
                                        icon = "mpd";
                                        hostName = "MPEG-DASH URL";
                                    } else {
                                        icon = v.host;
                                        hostName = vidHosts[v.host];
                                    }
                                } else {
                                    icon = v.host;
                                    hostName = vidHosts[v.host];
                                }
                                e.next(".dropdown-menu.show").append(
                                    '<a class="dropdown-item" href="' +
                                        v.url +
                                        '" target="_blank"><img src="' +
                                        imgCDNURL +
                                        "assets/img/logo/" +
                                        icon +
                                        '.png" width="16" height="16" class="mr-2 me-2">' +
                                        hostName
                                            .replace("|Additional Host", "")
                                            .replace("|New", "") +
                                        "</a>"
                                );
                            }
                        });
                    } else {
                        swalError(res.message);
                    }
                },
                function (xhr) {
                    swalError(
                        "Failed to fetch data from server! Please contact the admin."
                    );
                }
            );
		},
	},
	cache: {
		clear: {
			ajax: function (id, sCallback, eCallback) {
				var lbs = localStorage.getItem("lb"),
					lb = lbs !== "null" ? JSON.parse(lbs) : [baseURL],
					data = {
						id: id,
						action: "clearVideoCache",
						token: Cookies.get("adv_token", main.cookieConfig),
					};
				if (lb.length > 0) {
					$.each(lb, function (i, v) {
						if (i === lb.length - 1) {
							ajaxPOST(
								v + "ajax/admin-api/",
								data,
								sCallback,
								eCallback
							);
						} else {
							ajaxPOST(v + "ajax/admin-api/", data);
						}
					});
				}
			},
			single: function ($e) {
				videos.cache.clear.ajax(
					$e.data("id"),
					function (res) {
						if (res.status !== "fail") {
							swalSuccess(res.message);
						} else {
							swalError(res.message);
						}
					},
					function (xhr) {
						swalError(xhr.responseText);
					}
				);
			},
			multi: function (e) {
				var ids = [],
					cleared = [],
					failed = [];
				$("#ckAllVideos, #ckAllVideos1").prop("checked", false);
				$("#tbVideos tbody input[type=checkbox]:checked").each(
					function () {
						ids.push($(this).val());
					}
				);
				if (ids.length > 0) {
					var callback = function (res, currentIndex) {
							var nextIndex = currentIndex + 1,
								total = 0;
							if (res.status !== "fail") {
								cleared.push(ids[currentIndex]);
							} else {
								failed.push(ids[currentIndex]);
							}
							total = cleared.length + failed.length;
							if (total >= ids.length) {
								if (failed.length > 0) {
									swalInfo(
										"Cache of " +
											cleared.length +
											" videos was successfully cleared and cache of " +
											failed.length +
											" other videos failed to clear."
									);
								} else {
									swalSuccess(
										"These " +
											total +
											" videos have been successfully deleted."
									);
								}
							} else {
								clearCacheNow(ids[nextIndex], nextIndex);
							}
						},
						clearCacheNow = function (id, currentIndex) {
							videos.cache.clear.ajax(
								id,
								function (res) {
									callback(res, currentIndex);
								},
								function (xhr) {
									callback({ status: "fail" }, currentIndex);
								}
							);
						};
					swalQuestion(
						"Are you sure?",
						"You will clear the stored cache of " +
							ids.length +
							" videos.",
						function (isConfirm) {
							if (!isConfirm) return;
							clearCacheNow(ids[0], 0);
						}
					);
				} else {
					swalWarning(
						"Please check the videos you want to clear cache stored first."
					);
				}
			},
		},
	},
	checker: {
		multi: function (e) {
			var $table = $("#tbVideos tbody"),
				$ckItems = $table.find("input[type=checkbox]:checked"),
				updateStatus = function (id, sources, next) {
					ajaxPOST(
						videos.url,
						{
							action: "updateStatus",
							id: id,
							sources: sources,
						},
						function (res) {
							checkNow($($ckItems[next]).val(), next);
						},
						function (xhr) {
							checkNow($($ckItems[next]).val(), next);
						}
					);
				},
				getSources = function (serverLink, id, next) {
					var api = serverLink.split("?");
					ajaxPOST(
						api[0],
						api[1],
						function (res) {
							if (res.status !== "fail") {
								updateStatus(id, res.sources, next);
							} else {
								updateStatus(id, [], next);
							}
						},
						function (xhr) {
							checkNow($($ckItems[next]).val(), next);
						}
					);
				},
				checkNow = function (id, index) {
					var next = index + 1;
					if (index <= $ckItems.length) {
						ajaxPOST(
							videos.url,
							{
								action: "getServer",
								id: id,
								source: "db",
							},
							function (res) {
								if (res.status !== "fail") {
									getSources(res.result, id, next);
								} else {
									checkNow($($ckItems[next]).val(), next);
								}
							},
							function (xhr) {
								checkNow($($ckItems[next]).val(), next);
							}
						);
					} else {
						videos.reload();
						e.prop("disabled", false);
					}
				};
			if ($ckItems.length > 0) {
				e.prop("disabled", true);
				$ckItems.each(function (i, v) {
					$table
						.find("#status-" + $(this).val())
						.attr(
							"class",
							"fas fa-spin fa-lg fa-sync-alt text-info"
						);
				});
				checkNow($($ckItems[0]).val(), 0);
			} else {
				swalWarning("Please select the video you want to check!");
			}
		},
	},
	delete: {
		ajax: function (id, sCallback, eCallback) {
			ajaxPOST(
				videos.url,
				{
					id: id,
					action: "delete",
				},
				sCallback,
				eCallback
			);
		},
		single: function ($e) {
			var id = $e.data("id"),
				name = $e.data("name");
			swalQuestion(
				"Are you sure?",
				"Delete the '" + name + "' video. " + notRecovered(),
				function (isConfirm) {
					if (!isConfirm) return;
					$e.prop("disabled", true);
					videos.delete.ajax(
						id,
						function (res) {
							if (res.status !== "fail") {
								videos.reload();
								swalSuccess(res.message);
							} else {
								$e.prop("disabled", false);
								swalError(res.message);
							}
						},
						function (xhr) {
							swalError(
								"Failed to fetch data from server! Please contact the admin."
							);
							$e.prop("disabled", false);
						}
					);
				}
			);
		},
		multi: function ($e) {
			var ids = [],
				deleted = [],
				failed = [];
			$e.prop("disabled", true);
			$("#ckAllVideos, #ckAllVideos1").prop("checked", false);
			$("#tbVideos tbody input[type=checkbox]:checked").each(function () {
				ids.push($(this).val());
			});
			if (ids.length > 0) {
				var callback = function (res, currentIndex) {
						var nextIndex = currentIndex + 1,
							total = 0;
						if (res.status !== "fail") {
							deleted.push(ids[currentIndex]);
						} else {
							failed.push(ids[currentIndex]);
						}
						total = deleted.length + failed.length;
						if (total >= ids.length) {
							$e.prop("disabled", false);
							videos.reload();
							if (failed.length > 0) {
								swalInfo(
									deleted.length +
										" videos were successfully deleted and " +
										failed.length +
										" other videos failed to be deleted."
								);
							} else {
								swalSuccess(
									"These " +
										total +
										" videos have been successfully deleted."
								);
							}
						} else {
							deleteNow(ids[nextIndex], nextIndex);
						}
					},
					deleteNow = function (id, currentIndex) {
						videos.delete.ajax(
							id,
							function (res) {
								callback(res, currentIndex);
							},
							function (xhr) {
								callback({ status: "fail" }, currentIndex);
							}
						);
					};
				swalQuestion(
					"Are you sure?",
					"You will delete " +
						ids.length +
						" videos. " +
						notRecovered(),
					function (isConfirm) {
						if (isConfirm) {
							deleteNow(ids[0], 0);
						} else {
							$e.prop("disabled", false);
							return;
						}
					}
				);
			} else {
				swalWarning(
					"Please check the videos you want to delete first."
				);
			}
		},
		byHost: function () {},
	},
	dmca: {
		ajax: function (id, takedown, sCallback, eCallback) {
			ajaxPOST(
				videos.url,
				{
					id: id,
					action: "dmcaTakedown",
					takedown: takedown,
				},
				sCallback,
				eCallback
			);
		},
		single: function ($e, takedown) {
			$e.prop("disabled", true);
			videos.dmca.ajax(
				$e.data("id"),
				takedown,
				function (res) {
					if (res.status !== "fail") {
						videos.reload();
						swalSuccess(res.message);
					} else {
						$e.prop("disabled", false);
						swalError(res.message);
					}
				},
				function (xhr) {
					swalError(
						"Failed to fetch data from server! Please contact the admin."
					);
					$e.prop("disabled", false);
				}
			);
		},
		multi: function ($e, newStatus) {
			var ids = [],
				takedown = [],
				failed = [];
			$e.prop("disabled", true);
			$("#ckAllVideos, #ckAllVideos1").prop("checked", false);
			$("#tbVideos tbody input[type=checkbox]:checked").each(function () {
				ids.push($(this).val());
			});
			if (ids.length > 0) {
				var text =
						newStatus == 1
							? "You will takedown " + ids.length + " videos."
							: "You will cancel the takedown of " +
							  ids.length +
							  " videos.",
					callback = function (res, currentIndex) {
						var nextIndex = currentIndex + 1,
							total = 0;
						if (res.status !== "fail") {
							takedown.push(ids[currentIndex]);
						} else {
							failed.push(ids[currentIndex]);
						}
						total = takedown.length + failed.length;
						if (total >= ids.length) {
							$e.prop("disabled", false);
							videos.reload();
							if (failed.length > 0) {
								swalInfo(
									takedown.length +
										" videos have been updated successfully and . " +
										failed.length +
										" other videos failed to update."
								);
							} else {
								swalSuccess(
									"These " +
										total +
										" videos have been successfully taken down."
								);
							}
						} else {
							takedownNow(ids[nextIndex], nextIndex);
						}
					},
					takedownNow = function (id, currentIndex) {
						videos.dmca.ajax(
							id,
							newStatus,
							function (res) {
								callback(res, currentIndex);
							},
							function (xhr) {
								callback({ status: "fail" }, currentIndex);
							}
						);
					};
				swalQuestion("Are you sure?", text, function (isConfirm) {
					if (isConfirm) {
						takedownNow(ids[0], 0);
					} else {
						$e.prop("disabled", false);
						return;
					}
				});
			} else {
				swalWarning(
					"Please check the videos you want to takedown first."
				);
			}
		},
	},
	subtitles: {
		autocomplete: {
			minLength: 3,
			source: function (req, res) {
				$.ajax({
					url: videos.url,
					type: "POST",
					data: {
						action: "searchSubtitles",
						q: req.term,
					},
					success: function (data) {
						res(data);
					},
				});
			},
			select: function (e, ui) {},
		},
		createFormGroup: function (name, lang, type, index) {
			var ext =
					"(.srt, .vtt, .ass, .sub, .stl, .dfxp, .ttml, .sbv, .txt)",
				label = type === "file" ? "Subtitle URL" : "Choose file",
				title = type === "file" ? "Upload Subtitle" : "Insert URL",
				onclick =
					type === "file"
						? "videos.subtitles.uploadFile($(this))"
						: "videos.subtitles.insertURL($(this))",
				icon = type === "file" ? "upload" : "link",
				input =
					type === "file"
						? `<input type="url" name="${name}" class="form-control" placeholder="${label} ${ext}">`
						: `<div class="custom-file"><input type="file" id="sub-${index}" name="${name}" class="custom-file-input subtitle" accept=".srt, .vtt, .ass, .sub, .stl, .dfxp, .ttml, .sbv, .txt"><label class="custom-file-label" for="sub-${index}">${label} ${ext}</label></div>`;
			return `<div class="form-group" data-index="${index}"><div class="input-group"><div class="input-group-prepend">${subtitles.html(
				lang
			)}</div>${input}<div class="input-group-append"><button type="button" class="btn btn-outline-primary" data-toggle="tooltip" title="${title}" onclick="${onclick}" data-index="0"><i class="fas fa-${icon}"></i></button><button type="button" class="btn btn-outline-danger" data-toggle="tooltip" data-index="${index}" title="Remove Subtitle" onclick="videos.subtitles.remove($(this))"><i class="fas fa-minus"></i></button></div></div></div>`;
		},
		edit: function (id, lang, sub) {
			var $md = $("#mdEditSubtitle");
			$md.find("#editSubId").val(id);
			$md.find("#editSubURL").val(sub);
			$md.find("#editSubLang").val(lang).trigger("change");
			$md.find("#editSubFile").val("");
			$md.find("#editSubFile").val(null);
			$md.find('label[for="editSubFile"]').text(
				$md.find("#editSubFile").attr("placeholder")
			);
			$md.find("#editSubType").val("url");
			$md.find("#fgEditSubURL").removeClass("d-none");
			$md.find("#fgEditSubFile").addClass("d-none");
			$md.modal("show");
		},
		delete: function (id, lang) {
			swalQuestion(
				"Are you sure?",
				"Are you sure you want to delete the " + lang + " subtitle?",
				function (isConfirm) {
					if (!isConfirm) return;
					ajaxPOST(
						videos.url,
						{
							action: "deleteSubtitle",
							id: id,
						},
						function (res) {
							if (res.status !== "fail") {
								$('[data-sub="' + id + '"]').remove();
								swalSuccess(res.message);
							} else {
								swalError(res.message);
							}
						},
						function (xhr) {
							swalError(xhr.responseText);
						}
					);
				}
			);
		},
		add: function () {
			var $cs = $("#subsWrapper"),
				$fg = $cs.find(".form-group"),
				html = videos.subtitles.createFormGroup(
					"sub-url[]",
					"lang-url[]",
					"file",
					$fg.length
				);
			$cs.append(html);
			if (typeof searchSubtitle !== "undefined") {
				var $url = $('input[type="url"]'),
					conf = videos.subtitles.autocomplete;
				conf.select = function (e, ui) {
					$url.prev()
						.find("select")
						.val(ui.item.label)
						.trigger("change");
				};
				$url.searchSubtitle(conf);
			}
			loadSelect2();
			loadTooltip();
		},
		uploadFile: function ($e) {
			$e.closest(".form-group").replaceWith(
				videos.subtitles.createFormGroup(
					"sub-file[]",
					"lang-file[]",
					"url",
					$e.data("index")
				)
			);
			bsCustomFileInput.init();
			loadSelect2();
			loadTooltip();
		},
		insertURL: function ($e) {
			$e.closest(".form-group").replaceWith(
				videos.subtitles.createFormGroup(
					"sub-url[]",
					"lang-url[]",
					"file",
					$e.data("index")
				)
			);
			if (typeof searchSubtitle !== "undefined") {
				var $url = $e.find('input[type="url"]'),
					conf = videos.subtitles.autocomplete;
				conf.select = function (i, ui) {
					$url.prev().find("select").val(ui.item.label);
				};
				$url.searchSubtitle(conf);
			}
			loadSelect2();
			loadTooltip();
		},
		remove: function ($e) {
			$e.closest(".form-group").remove();
		},
		get: function (e) {
			var d = e.next(".dropdown-menu");
			if (!d.hasClass("show")) {
				ajaxPOST(
					videos.url,
					{
						action: "getSubtitles",
						id: e.data("id"),
					},
					function (res) {
						if (res.status !== "fail") {
							d.html("");
							$.each(res.result, function (i, v) {
								e.next(".dropdown-menu.show").append(
									'<a class="dropdown-item" href="' +
										v.url +
										'" target="_blank">' +
										v.name +
										"</a>"
								);
							});
						} else {
							swalError(res.message);
						}
					},
					function (xhr) {
						swalError(
							"Failed to fetch data from server! Please contact the admin."
						);
					}
				);
			}
		},
	},
	removePoster: function (id, $e) {
		if (typeof id !== "undefined" && id !== "") {
			$e.prop("disabled", true);
			ajaxPOST(
				videos.url,
				{
					action: "removePoster",
					id: id,
				},
				function (res) {
					if (res.status !== "fail") {
						$e.closest(".form-group").remove();
						showToast(res.message, "success");
					} else {
						showToast(res.message, "error");
					}
					$e.prop("disabled", false);
				},
				function (xhr) {
					showToast(
						"Poster failed to delete. Insert a new poster if you want to replace it!",
						"error"
					);
					$e.prop("disabled", false);
				}
			);
		}
	},
	scrollToHosts: function () {
		$("#collapseSites").collapse("show");
		$("html,body").animate(
			{
				scrollTop: $("#collapseSites").offset().top,
			},
			"slow"
		);
	},
	rename: function ($e) {
		var id = $e.data("id"),
			$tr = $("#tbVideos tr#" + id),
			$title = $e.closest(".input-group-prepend").next("input");
		ajaxPOST(
			videos.url,
			{
				id: id,
				name: $title.val(),
				action: "rename",
			},
			function (res) {
				$tr.find("a.btn-cancel").trigger("click");
				if (res.status !== "fail") {
					showToast(res.message, "success");
				} else {
					showToast(res.message, "error");
					$tr.find(".title").text($e.data("title"));
				}
			},
			function (xhr) {
				$tr.find("a.btn-cancel").trigger("click");
				showToast(res.responseText, "error");
			}
		);
	},
	list: function () {
		if ($("#tbVideos").length) {
			$("#tbVideos").DataTable({
				ajax:
					adminURL +
					"ajax/videos-list/?status=" +
					$_GET("status") +
					"&dmca=" +
					$_GET("dmca"),
				serverSide: true,
				columns: [
					{
						data: "id",
						responsivePriority: 0,
						className: "text-center",
						render: function (value, type, row, meta) {
							return btnCheckbox(value, "video", "#tbVideos");
						},
					},
					{
						data: "title",
						responsivePriority: 1,
						render: function (value, type, row, meta) {
							var img =
									'<img data-src="' +
									row.poster_url +
									'" class="img-thumbnail d-none" style="max-width:200px" alt="' +
									value +
									"\" onerror=\"$(this).attr('src', '" +
									imgCDNURL +
									"assets/img/notfound.jpg');\">",
								html =
									'<div class="title" contentEditable="plaintext-only" data-toggle="tooltip" title="' +
									value +
									'">' +
									value +
									'</div><div class="position-absolute" style="top:0;right:0;z-index:2"><a href="javascript:void(0)" class="fas fa-square-pen fa-xl btn-rename text-primary" title="Rename"></a><a href="javascript:void(0)" class="fas fa-square-xmark fa-xl btn-cancel text-danger d-none" title="Cancel"></a></div>';
							if (row.poster !== "" && row.poster !== null) {
								html = img + html;
							}
							return (
								'<div class="d-block position-relative">' +
								html +
								"</div>"
							);
						},
					},
					{
						data: "host",
						className: "text-center",
						render: function (value, type, row, meta) {
							if (row.alt_count > 0) {
								return (
									'<div class="dropdown"><button class="btn btn-outline-default btn-sm dropdown-toggle alt" type="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-expanded="false" data-id="' +
									row.id +
									'"><img src="' +
									imgCDNURL +
									"assets/img/logo/" +
									value +
									'.png" width="16" height="16"></button><div class="dropdown-menu shadow border-0" style="max-height:240px"></div></div>'
								);
							} else {
								return (
									'<a href="' +
									row.link +
									'" target="_blank" title="' +
									(typeof vidHosts[value] !== "undefined"
										? vidHosts[value]
										: value
									)
										.replace("|Additional Host", "")
										.replace("|New", "") +
									'" data-toggle="tooltip"><img src="' +
									imgCDNURL +
									"assets/img/logo/" +
									value +
									'.png" width="16" height="16"></a>'
								);
							}
						},
					},
                    {
                        data: "slug"
                    },
					{
						data: "status",
						className: "text-center",
						render: function (value, type, row, meta) {
							var icon = "check",
								color = "success",
								text = "Good",
								html = "";
							if (value == 2) {
								icon = "minus";
								color = "warning";
								text = "Warning";
							} else if (value == 1) {
								icon = "times";
								color = "danger";
								text = "Broken";
							}
							html =
								'<i class="fas fa-lg fa-' +
								icon +
								"-circle text-" +
								color +
								' status" data-toggle="tooltip" id="status-' +
								row.id +
								'" title="' +
								text +
								'"></i>';
							return html;
						},
					},
					{
						data: "dmca",
						className: "text-center",
						render: function (value, type, row, meta) {
							return value == 1
								? '<i class="fas fa-lg fa-ban text-danger dmca" data-toggle="tooltip" title="Takedown"></i>'
								: "";
						},
					},
					{
						data: "sub_count",
						className: "text-center",
						render: function (value, type, row, meta) {
							if (parseInt(value) > 0) {
								return (
									'<div class="dropdown"><a class="btn btn-outline-primary btn-sm dropdown-toggle" href="#" role="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Subtitles" onclick="videos.subtitles.get($(this))" data-id="' +
									row.id +
									'"><i class="fas fa-lg fa-language"></i></a><div class="dropdown-menu shadow border-0" style="max-height:240px"></div></div>'
								);
							} else {
								return "";
							}
						},
					},
					{
						data: "views",
						className: "text-right",
					},
					{
						data: "name",
					},
					{
						data: "added",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "updated",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "id",
						className: "text-center",
						responsivePriority: 2,
						render: function (value, type, row) {
							var takedown =
									'<em class="fas fa-ban mr-2 me-2"></em>Takedown',
								newStatus = 1;
							if (row.dmca > 0) {
								takedown =
									'<em class="fas fa-check mr-2 me-2"></em>Cancel Takedown';
								newStatus = 0;
							}
							return (
								'<div class=""dropdown"">' +
								btnCog() +
								'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
								btnCopyEmbed(row.actions.embed_code) +
								btnEmbed(row.actions.embed) +
								btnDownload(row.actions.download) +
								'<div class="dropdown-divider"></div>' +
								btnEditItem(
									adminURL + "videos/edit/?id=" + value
								) +
								btnDeleteItem(value, row.title) +
								'<button data-id="' +
								value +
								'" class="dropdown-item clear" type="button"><i class="fas fa-eraser mr-2 me-2"></i>Clear Cache</button>' +
								(uRole === 0
									? '<div class="dropdown-divider"></div><button onclick="videos.dmca.single($(this), ' +
									  newStatus +
									  ')" data-id="' +
									  value +
									  '" class="dropdown-item" type="button">' +
									  takedown +
									  "</button>"
									: "") +
								"</div></div>"
							);
						},
					},
				],
				columnDefs: [
					{
						orderable: false,
						targets: [0, 6, 11],
					},
					{
						visible: true,
						targets: [0, 1, 11],
						className: "noVis",
					},
				],
				order: [[9, "desc"]],
				drawCallback: function () {
					loadTooltip();
					if (localStorage.getItem("showThumb") == 1) {
						$("#shThumbnail").prop("checked", true);
					}
					videos.showHideThumbnail($("#shThumbnail").prop("checked"));
					$("#tbVideos button.alt").click(function () {
						videos.alternatives.get($(this));
					});
					$("#tbVideos button.clear").click(function () {
						videos.cache.clear.single($(this));
					});
					$("#tbVideos button.delete").click(function () {
						videos.delete.single($(this));
					});
					$("#tbVideos button.copy-embed").click(function () {
						copyText($(this).data("text"), "Embed");
					});
					$("#tbVideos a.btn-rename").click(function () {
						var $t = $(this)
								.closest(".position-absolute")
								.prev(".title"),
							id = $(this).closest("td").closest("tr").attr("id");
						$(this).toggleClass("d-none");
						$(this).next(".btn-cancel").toggleClass("d-none");
						$t.replaceWith(
							'<div class="input-group input-group-sm" onclick="$(this).removeClass(\'focus\');$(this).addClass(\'focus\');$(this).css(\'min-width\', 220)"><div class="input-group-prepend"><button class="btn btn-success btn-save" type="button" style="line-height:1.4!important" onclick="videos.rename($(this))" data-id="' +
								id +
								'" data-title="' +
								$t.text() +
								'" title="Update"><i class="fas fa-save"></i></button></div><input type="text" class="form-control" value="' +
								$t.text() +
								'"></div>'
						);
					});
					$("#tbVideos a.btn-cancel").click(function () {
						var $t = $(this)
								.closest(".position-absolute")
								.prev(".input-group"),
							value = $t.find("input").val();
						$(this).toggleClass("d-none");
						$(this).prev(".btn-rename").toggleClass("d-none");
						$t.replaceWith(
							'<div class="title" contentEditable="plaintext-only" data-toggle="tooltip" title="' +
								value +
								'">' +
								value +
								"</div>"
						);
						loadTooltip();
					});
				},
			});
		}
	},
	reload: function () {
		$("#ckAllVideos, #ckAllVideos1").prop("checked", false);
		$(".toolbar .btn-hidden").addClass("d-none");
		$("#tbVideos").DataTable().ajax.reload(null, false);
	},
	init: function () {
		videos.list();

		var $btnImport = $("#btnUploadVideo"),
			$fileUpload = $("#importVideos"),
			$tbImportVideos;
		if ($("#tbImportVideos").length) {
			$tbImportVideos = $("#tbImportVideos").DataTable({
				columns: [
					{
						data: "title",
						responsivePriority: 0,
					},
					{
						data: "host",
						className: "text-center",
						render: function (value, type, row, meta) {
							if (row.alt_count > 0) {
								return (
									'<div class="dropdown"><button class="btn btn-outline-default btn-sm dropdown-toggle alt" type="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-expanded="false" data-id="' +
									row.id +
									'"><img src="' +
									imgCDNURL +
									"assets/img/logo/" +
									value +
									'.png" width="16" height="16"></button><div class="dropdown-menu shadow border-0" style="max-height:240px"></div></div>'
								);
							} else {
								return (
									'<a href="' +
									row.link +
									'" target="_blank" title="' +
									(typeof vidHosts[value] !== "undefined"
										? vidHosts[value]
										: value
									)
										.replace("|Additional Host", "")
										.replace("|New", "") +
									'" data-toggle="tooltip"><img src="' +
									imgCDNURL +
									"assets/img/logo/" +
									value +
									'.png" width="16" height="16"></a>'
								);
							}
						},
					},
					{
						data: "sub_count",
						className: "text-center",
						render: function (value, type, row, meta) {
							if (parseInt(value) > 0) {
								return (
									'<div class="dropdown"><a class="btn btn-outline-primary btn-sm dropdown-toggle" href="#" role="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Subtitles" onclick="videos.subtitles.get($(this))" data-id="' +
									row.id +
									'"><i class="fas fa-lg fa-language"></i></a><div class="dropdown-menu shadow border-0" style="max-height:240px"></div></div>'
								);
							} else {
								return "";
							}
						},
					},
					{
						data: "added",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "status",
						className: "text-center",
						render: function (value, type, row, meta) {
							var icon = "check",
								color = "success",
								text = "Good",
								html = "";
							if (value == 2) {
								icon = "minus";
								color = "warning";
								text = "Warning";
							} else if (value == 1) {
								icon = "times";
								color = "danger";
								text = "Broken";
							}
							html =
								'<i class="fas fa-lg fa-' +
								icon +
								"-circle text-" +
								color +
								' status" data-toggle="tooltip" id="status-' +
								row.id +
								'" title="' +
								text +
								'"></i>';
							return html;
						},
					},
					{
						data: "actions",
						className: "text-center",
						responsivePriority: 1,
						render: function (value, type, row) {
							if (value.hasOwnProperty("embed")) {
								return (
									'<div class=""dropdown"">' +
									btnCog() +
									'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
									btnCopyEmbed(value.embed_code) +
									btnEmbed(value.embed) +
									btnDownload(value.download) +
									'<div class="dropdown-divider"></div>' +
									btnEditItem(
										adminURL + "videos/edit/?id=" + row.id
									) +
									btnDeleteItem(row.id, row.title) +
									"</div></div>"
								);
							} else {
								return "";
							}
						},
					},
				],
				order: [[3, "desc"]],
				columnDefs: [
					{
						orderable: false,
						targets: [2, 5],
					},
					{
						visible: true,
						targets: [0, 5],
						className: "noVis",
					},
				],
				drawCallback: function () {
					loadTooltip();
					$("#tbImportVideos button.delete").click(function () {
						videos.delete.single($(this));
						$tbImportVideos
							.row($(this).parents("tr"))
							.remove()
							.draw();
					});
					$("#tbImportVideos button.alt").click(function () {
						videos.alternatives.get($(this));
					});
					$("#tbImportVideos button.copy-embed").click(function () {
						copyText($(this).data("text"), "Embed");
					});
				},
			});
		}

		$fileUpload.on("change", function (e) {
			$btnImport.prop("disabled", e.target.files.length === 0);
		});

		$("#mdVideosImport").on("hidden.bs.modal", function (e) {
			$(e.target).find("form").get(0).reset();
			$btnImport.prop("disabled", true);
			$tbImportVideos.clear().draw();
		});

		$("#frmImportVideos").on("submit", function (e) {
			e.preventDefault();
			e.stopPropagation();

			var data = new FormData(this),
				$btnUpload = $("#btnUploadVideo"),
				$progres = $("#importPercent"),
				precent = 0,
				importComplete = function () {
					$progres.addClass("d-none");
					$fileUpload.val("");
					$btnUpload.prop("disabled", true);
					videos.reload();
				},
				importProcess = function (file, page) {
					$progres.removeClass("d-none");
					$btnUpload.prop("disabled", true);
					$.ajax({
						type: "POST",
						url: videos.importUrl,
						cache: false,
						data:
							"action=importProcess&file=" +
							file +
							"&page=" +
							page,
						beforeSend: function () {
							$btnUpload.prop("disabled", true);
						},
						success: function (res) {
							if (res.status !== "fail") {
								percent = res.result.percent;
								$progres
									.find(".progress-bar")
									.css("width", percent + "%")
									.attr("aria-valuenow", percent)
									.text(percent + "%");
								if (res.result.list.length > 0) {
									$tbImportVideos.rows
										.add(res.result.list)
										.draw(false);
								}
								if (percent < 100) {
									importProcess(res.result.file, page + 1);
								} else {
									showToast(res.message, "success");
									importComplete();
								}
							} else {
								showToast(res.message, "error");
								importComplete();
							}
						},
						error: function () {
							showToast(
								"Server cannot be accessed. Please contact admin!",
								"error"
							);
							importComplete();
						},
					});
				};

			if (this.checkValidity() === false || $btnUpload.prop("disabled")) {
				$(this).addClass("was-validated");
				return;
			}
			if (document.getElementById("importVideos").files.length) {
				$.ajax({
					type: "POST",
					url: videos.importUrl,
					contentType: false,
					processData: false,
					cache: false,
					data: data,
					beforeSend: function () {
						$btnUpload.prop("disabled", true);
					},
					success: function (res) {
						if (
							res.status !== "fail" &&
							res.result !== null &&
							res.result !== ""
						) {
							importProcess(res.result, 0);
						} else {
							showToast(res.message, "error");
						}
					},
					error: function () {
						showToast(
							"Server cannot be accessed. Please contact admin!",
							"error"
						);
						$btnUpload.prop("disabled", true);
					},
				});
			} else {
				showToast("Insert the video file first!", "error");
			}
		});

		var $tbBulkVideos;
		if ($("#tbBulkVideos").length) {
			$tbBulkVideos = $("#tbBulkVideos").DataTable({
				columns: [
					{
						data: "title",
						responsivePriority: 0,
					},
					{
						data: "host",
						className: "text-center",
						render: function (value, type, row, meta) {
							if (row.alt_count > 0) {
								return (
									'<div class="dropdown"><button class="btn btn-outline-default btn-sm dropdown-toggle alt" type="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-expanded="false" data-id="' +
									row.id +
									'"><img src="' +
									imgCDNURL +
									"assets/img/logo/" +
									value +
									'.png" width="16" height="16"></button><div class="dropdown-menu shadow border-0" style="max-height:240px"></div></div>'
								);
							} else {
								return (
									'<a href="' +
									row.link +
									'" target="_blank" title="' +
									(typeof vidHosts[value] !== "undefined"
										? vidHosts[value]
										: value
									)
										.replace("|Additional Host", "")
										.replace("|New", "") +
									'" data-toggle="tooltip"><img src="' +
									imgCDNURL +
									"assets/img/logo/" +
									value +
									'.png" width="16" height="16"></a>'
								);
							}
						},
					},
					{
						data: "sub_count",
						className: "text-center",
						render: function (value, type, row, meta) {
							if (parseInt(value) > 0) {
								return (
									'<div class="dropdown"><a class="btn btn-outline-primary btn-sm dropdown-toggle" href="#" role="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Subtitles" onclick="videos.subtitles.get($(this))" data-id="' +
									row.id +
									'"><i class="fas fa-lg fa-language"></i></a><div class="dropdown-menu shadow border-0" style="max-height:240px"></div></div>'
								);
							} else {
								return "";
							}
						},
					},
					{
						data: "added",
						className: "text-right",
						render: function (value, type, row) {
							return formatTimestamp(value);
						},
					},
					{
						data: "status",
						className: "text-center",
						render: function (value, type, row, meta) {
							var icon = "check",
								color = "success",
								text = "Good",
								html = "";
							if (value == 2) {
								icon = "minus";
								color = "warning";
								text = "Warning";
							} else if (value == 1) {
								icon = "times";
								color = "danger";
								text = "Broken";
							}
							html =
								'<i class="fas fa-lg fa-' +
								icon +
								"-circle text-" +
								color +
								' status" data-toggle="tooltip" id="status-' +
								row.id +
								'" title="' +
								text +
								'"></i>';
							return html;
						},
					},
					{
						data: "actions",
						className: "text-center",
						responsivePriority: 1,
						render: function (value, type, row) {
							if (value.hasOwnProperty("embed")) {
								return (
									'<div class=""dropdown"">' +
									btnCog() +
									'<div class="dropdown-menu dropdown-menu-right border-0 shadow">' +
									btnCopyEmbed(value.embed_code) +
									btnEmbed(value.embed) +
									btnDownload(value.download) +
									'<div class="dropdown-divider"></div>' +
									btnEditItem(
										adminURL + "videos/edit/?id=" + row.id
									) +
									btnDeleteItem(row.id, row.title) +
									"</div></div>"
								);
							} else {
								return "";
							}
						},
					},
				],
				order: [[3, "desc"]],
				columnDefs: [
					{
						orderable: false,
						targets: [2, 5],
					},
					{
						visible: true,
						targets: [0, 5],
						className: "noVis",
					},
				],
				drawCallback: function () {
					loadTooltip();
					$("#tbBulkVideos button.delete").click(function () {
						videos.delete.single($(this));
						$tbBulkVideos
							.row($(this).parents("tr"))
							.remove()
							.draw();
					});
					$("#tbBulkVideos button.copy-embed").click(function () {
						copyText($(this).data("text"), "Embed");
					});
				},
			});
		}

		$("#mdBulkVideo").on("hidden.bs.modal", function (e) {
			$(e.target).find("form").get(0).reset();
			$tbBulkVideos.clear().draw();
		});

		$("#frmBulkVideo").on("submit", function (e) {
			e.preventDefault();
			e.stopPropagation();

			var links = $("#txtBulkLinks").val().trim().split("\n"),
				useTitle = $("#useTitleAsSlug").prop("checked"),
				$btnSave = $("#btnSaveBulkVideo"),
				$progres = $("#saveBulkPercent"),
				precent = 0,
				saveBulkProcess = function (offset) {
					$progres.removeClass("d-none");
					$btnSave.prop("disabled", true);
					$.ajax({
						type: "POST",
						url: "ajax/",
						cache: false,
						data:
							"action=saveBulkProcess&total=" +
							links.length +
							"&data=" +
							links[offset] +
							"&offset=" +
							offset +
							"&useTitle=" +
							useTitle +
							"&token=" +
							Cookies.get("adv_token", main.cookieConfig),
						success: function (res) {
							percent = parseInt(
								(res.result.next / res.result.total) * 100
							);
							$progres
								.find(".progress-bar")
								.css("width", percent + "%")
								.attr("aria-valuenow", percent)
								.text(percent + "%");
							if (res.result.hasOwnProperty("data")) {
								$tbBulkVideos.row
									.add(res.result.data)
									.draw(false);
							}
							if (res.result.next < res.result.total) {
								saveBulkProcess(res.result.next);
							} else {
								showToast(res.message, "success");
								$("#txtBulkLinks").val("");
								$btnSave.prop("disabled", false);
								$progres.addClass("d-none");
								videos.reload();
							}
						},
						error: function () {
							showToast(
								"Server cannot be accessed. Please contact admin!",
								"error"
							);
							$progres.addClass("d-none");
							$btnSave.prop("disabled", false);
						},
					});
				};

			if (this.checkValidity() === false || $btnSave.prop("disabled")) {
				$(this).addClass("was-validated");
				return;
			}

			if (links.length) {
				$progres
					.find(".progress-bar")
					.css("width", "0%")
					.attr("aria-valuenow", "0")
					.text("0%");
				saveBulkProcess(0);
			} else {
				showToast("Insert the video links first!", "error");
			}
		});

		if (typeof $.ui !== "undefined") {
			$.widget("custom.searchSubtitle", $.ui.autocomplete, {
				_renderItem: function (ul, item) {
					return $("<li>")
						.append(
							'<strong>File Name: <span class="text-success">' +
								item.id +
								'</span><br>Language: <span class="text-primary">' +
								item.label +
								"</span></strong>"
						)
						.appendTo(ul);
				},
			});
		}

		if (typeof $.fn.searchSubtitle !== "undefined") {
			var conf = videos.subtitles.autocomplete;
			conf.select = function (e, ui) {
				$("#sub-lang-0").val(ui.item.label);
			};
			$("#sub-url-0").searchSubtitle(conf);
		}

		$("#mdEditSubtitle").detach().appendTo("body");
		$("#frmEditSubtitle").on("submit", function (e) {
			e.preventDefault();
			e.stopPropagation();

			var $md = $("#mdEditSubtitle"),
				data = new FormData(this),
				$btn = $(this).find('button[type="submit"]'),
				type = $("#editSubType").val();

			if (this.checkValidity() === false || $btn.prop("disabled")) {
				$(this).addClass("was-validated");
				return;
			}

			if (
				(document.getElementById("editSubFile").files.length > 0 &&
					type === "file") ||
				type === "url"
			) {
				$.ajax({
					type: "POST",
					url: videos.url,
					contentType: false,
					processData: false,
					cache: false,
					data: data,
					beforeSend: function () {
						$btn.prop("disabled", true);
					},
					complete: function () {
						$btn.prop("disabled", false);
					},
					success: function (res) {
						if (res.status !== "fail") {
							var $item = $(
									'.ui-sortable-handle[data-sub="' +
										res.result.id +
										'"]'
								),
								editSubtitle =
									"videos.subtitles.edit(" +
									res.result.id +
									", '" +
									res.result.lang +
									"', '" +
									res.result.sub +
									"')";
							$item
								.find(".float-left a")
								.attr("href", res.result.sub)
								.text(res.result.lang);
							$item
								.find(".float-right a:first-child")
								.attr("onclick", editSubtitle);
							$md.modal("hide");
							showToast(res.message, "success");
						} else {
							showToast(res.message, "error");
						}
					},
					error: function () {
						showToast(
							"Server cannot be accessed. Please contact admin!",
							"error"
						);
						$btn.prop("disabled", false);
					},
				});
			} else {
				showToast("Insert the Subtitle URL/File first!", "error");
			}
		});
		$("#mdEditSubtitle").on("hidden.bs.modal", function () {
			$("#frmEditSubtitle").get(0).reset();
		});

		$("#mdVideosExport").detach().appendTo("body");
		$("#mdVideosExport").on("shown.bs.modal", function () {
			showVideosExport();
		});
		$("#mdVideosImport").detach().appendTo("body");
		$("#mdBulkVideo").detach().appendTo("body");

		$("#mdDelHost").detach().appendTo("body");
		$("#mdDelHost").on("hidden.bs.modal", function () {
			var $btn = $("#frmDelHost button[type=submit]");
			$btn.find(".fas").attr("class", "fas fa-trash mr-2 me-2");
			$btn.prop("disabled", false);
			$(".coldelhost").removeClass("d-none");
			$("#ckDelAll").prop("checked", false);
			$("#ckDelHostSelected").html("");
			$("#frmDelHost").get(0).reset();
		});
		$(".ckdelhost").click(function () {
			var ckd = [],
				$uck = $("#ckDelAll");
			$(".ckdelhost:checked").each(function (i, e) {
				ckd.push($(this).data("name"));
			});
			if (ckd.length > 0) {
				$uck.prop("indeterminate", true);
			} else {
				$uck.prop("checked", true);
			}
			$("#ckDelHostSelected").html(ckd.join(", ").trim(", "));
		});
		$("#ckDelAll").click(function () {
			if ($(this).prop("checked")) {
				$(".ckdelhost").each(function (i, e) {
					$(e).prop("checked", false);
				});
				$("#ckDelHostSelected").html("");
			}
		});
		$("#txtScDelHost").on("keyup blur", function () {
			var sc = $(this).val().toLowerCase();
			$(".coldelhost").each(function () {
				if ($(this).data("host").indexOf(sc) < 0) {
					$(this).addClass("d-none");
				} else {
					$(this).removeClass("d-none");
				}
			});
		});
		$("#frmDelHost").on("submit", function (e) {
			e.preventDefault();
			e.stopPropagation();
			var data = [],
				$btn = $("#frmDelHost button[type=submit]"),
				complete = function () {
					$btn.find(".fas").attr(
						"class",
						"fas fa-spinner fa-spin mr-2 me-2"
					);
					$btn.prop("disabled", true);
				};
			$(".coldelhost input[type=checkbox]:checked").each(function () {
				data.push($(this).val());
			});
			if (confirm("Are you sure?") === true) {
				ajaxPOST(
					videos.url,
					{
						hostnames: data,
						action: "deleteByHostnames",
					},
					function (res) {
						if (res.status !== "fail") {
							showToast(res.message, "success");
							videos.reload();
							$("#mdDelHost").modal("hide");
						} else {
							showToast(res.message, "error");
							complete();
						}
					},
					function (xhr) {
						showToast(res.responseText, "error");
						$("#mdDelHost").modal("hide");
					}
				);
			}
		});

		$("#mdVideosRename").detach().appendTo("body");
		$("#mdVideosRename").on("hidden.bs.modal", function () {
			$("#frmRenameVideos").get(0).reset();
		});
		$("#frmRenameVideos").on("submit", function (e) {
			e.preventDefault();
			e.stopPropagation();
			var ids = [],
				data = $(this).serialize();
			$('#tbVideos tbody tr input[type="checkbox"]:checked').each(
				function () {
					ids.push($(this).val());
				}
			);
			data += "&ids=" + ids.join(",");
			ajaxPOST(
				videos.url,
				{
					data: data,
					action: "renameMulti",
				},
				function (res) {
					if (res.status !== "fail") {
						swalSuccess(res.message);
						videos.reload();
					} else {
						swalError(res.message);
					}
					$("#mdVideosRename").modal("hide");
				},
				function (xhr) {
					showToast(xhr.responseText, "error");
				}
			);
		});

		if (typeof $.fn.sortable !== "undefined") {
			$("#subtitles").sortable();
			$("#altWrapper").sortable({
				handle: ".move",
			});
		}

		$(".btn-upload-poster").click(function () {
			$("#posterUpload").toggleClass("d-none");
			$("#posterURL").toggleClass("d-none");
		});
	},
	showHideThumbnail: function (checked) {
		var $thumbs = $("#tbVideos img.img-thumbnail");
		if (checked) {
			localStorage.setItem("showThumb", 1);
			$thumbs.each(function (i) {
				$(this).attr("src", $(this).data("src"));
			});
			$thumbs.removeClass("d-none");
		} else {
			localStorage.setItem("showThumb", 0);
			$thumbs.addClass("d-none");
		}
	},
	gdrive_files: {
		delete: function ($e) {
			swalQuestion(
				"Are you sure?",
				"Delete the '" + $e.data("name") + "' mirror file.",
				function (isConfirm) {
					if (!isConfirm) return;
					ajaxPOST(
						gdrive_files.url,
						{
							id: $e.data("id"),
							action: "deleteMirror",
						},
						function (res) {
							if (res.status !== "fail") {
								$e.closest("li").remove();
								swalSuccess(res.message);
							} else {
								swalError(res.message);
							}
						},
						function (xhr) {
							swalError(xhr.responseText);
						}
					);
				}
			);
		},
	},
	exportAsCSV: function ($e) {
		var ids = [];
		$e.prop("disabled", true);
		$("#ckAllVideos, #ckAllVideos1").prop("checked", false);
		$("#tbVideos tbody input[type=checkbox]:checked").each(function () {
			ids.push($(this).val());
		});
		if (ids.length) {
			ajaxPOST(
				videos.exportUrl,
				{
					ids: ids.join(","),
					action: "exportAsCSV",
				},
				function (data) {
					if (data.status !== "fail") {
						window.open(data.result, "_blank");
						showToast(data.message, "success");
					} else {
						showToast(data.message, "error");
					}
					$e.prop("disabled", false);
				},
				function (xhr) {
					showToast(xhr.responseText, "error");
					$e.prop("disabled", false);
				}
			);
		}
	},
};
var player = {
	alternative: {
		add: function () {
			swal(
				{
					title: "Info",
					text: "You can add some alternative video urls from the user page!",
					type: "info",
					showCancelButton: true,
					confirmButtonClass: "btn-primary",
					confirmButtonText: "OK",
					cancelButtonClass: "btn-danger",
					cancelButtonText: "Cancel",
					closeOnConfirm: true,
					closeOnCancel: true,
				},
				function (isConfirm) {
					if (isConfirm) {
						location.href = adminURL + "videos/new/";
					}
				}
			);
		},
	},
	subtitle: {
		insert: function ($e) {
			videos.subtitles.insertURL($e);
		},
		remove: function ($e) {
			videos.subtitles.remove($e);
		},
		upload: function ($e) {
			videos.subtitles.uploadFile($e);
		},
		add: function () {
			var $cs = $("#subsWrapper"),
				$fg = $cs.find(".input-group");
			if ($fg.length < 10) {
				$cs.append(
					videos.subtitles.createFormGroup(
						"sub-url[]",
						"lang-url[]",
						"file",
						$fg.length
					)
				);
				loadSelect2();
				loadTooltip();
			} else {
				swalWarning("A maximum of 10 subtitle URLs/files are allowed");
			}
		},
	},
};

$(document).ready(function ($) {
	/**
	 * main start
	 */
	main.init();
	/**
	 * main end
	 */

	/**
	 * dashboard start
	 */
	$("#modalExtApps").detach().appendTo("body");
	$("#modalExtApps").on("hide.bs.modal", function () {
		if ($("#hideForever").prop("checked")) {
			ajaxPOST(
				settings.url,
				"action=hideExtDialog",
				function (res) {},
				function (xhr) {}
			);
		}
	});
	dashboard.supportChecker();
	dashboard.popularVideos.list();
	dashboard.recentVideos.list();
	dashboard.chart.videoStatus(".video-status");
	dashboard.chart.serverStatus(".server-status");

	var $usrView = document.querySelector("#views > .chart");
	dashboard.chart.views.load("seven_days", 0, $usrView);
	$('#views input[name="options"]').click(function () {
		dashboard.chart.views.load($(this).val(), 0, $usrView);
	});
	/**
	 * dashboard end
	 */

	/**
	 * gdrive_accounts start
	 */
	gdrive_accounts.list();
	/**
	 * gdrive_accounts end
	 */

	/**
	 * gdrive_files start
	 */
	gdrive_files.list();
	/**
	 * gdrive_files end
	 */

	/**
	 * gdrive_backup_files start
	 */
	gdrive_backup_files.list();
	/**
	 * gdrive_backup_files end
	 */

	/**
	 * gdrive_backup_queue start
	 */
	gdrive_backup_queue.list();
	/**
	 * gdrive_backup_files end
	 */

	/**
	 * load_balancers start
	 */
	load_balancers.list();

	if (typeof $.fn.multiSelect !== "undefined") {
		var disallowHostOptions = Object.assign(multiSelectOptions(), {
			selectableHeader:
				"<div class='header'>Enabled Hosts</div>" +
				main.multiSelectSearch,
			selectionHeader:
				"<div class='header'>Disabled Hosts</div>" +
				main.multiSelectSearch,
		});
		$("#disallow_hosts").multiSelect(disallowHostOptions);

		var disallowContinentOptions = Object.assign(multiSelectOptions(), {
			selectableHeader:
				"<div class='header'>Allowed</div>" + main.multiSelectSearch,
			selectionHeader:
				"<div class='header'>Disallowed</div>" + main.multiSelectSearch,
		});
		$("#disallow_continent").multiSelect(disallowContinentOptions);
	}
	/**
	 * load_balancers end
	 */

	/**
	 * settings start
	 */
	if (typeof $.fn.multiSelect !== "undefined") {
		var bypassHostOptions = Object.assign(multiSelectOptions(), {
				selectableHeader:
					"<div class='header'>Direct Hosts</div>" +
					main.multiSelectSearch,
				selectionHeader:
					"<div class='header'>Bypassed Hosts</div>" +
					main.multiSelectSearch,
			}),
			disabledHostOptions = Object.assign(multiSelectOptions(), {
				selectableHeader:
					"<div class='header'>Enabled Hosts</div>" +
					main.multiSelectSearch,
				selectionHeader:
					"<div class='header'>Disabled Hosts</div>" +
					main.multiSelectSearch,
			}),
			disabledResOptions = Object.assign(multiSelectOptions(), {
				selectableHeader:
					"<div class='header'>Enabled Resolutions</div>" +
					main.multiSelectSearch,
				selectionHeader:
					"<div class='header'>Disabled Resolutions</div>" +
					main.multiSelectSearch,
			}),
			bannedCoutriesOptions = Object.assign(window.multiSelectOptions(), {
				selectableHeader:
					"<div class='header'>Allowed Countries</div>" +
					main.multiSelectSearch,
				selectionHeader:
					"<div class='header'>Banned Countries</div>" +
					main.multiSelectSearch,
			});
		$("#bypass_hosts, #bypass_host").multiSelect(bypassHostOptions);
		$("#disable_host").multiSelect(disabledHostOptions);
		$("#disable_resolution").multiSelect(disabledResOptions);
		$("#banned_countries").multiSelect(bannedCoutriesOptions);
	}

	$("#modalCustomVAST").detach().appendTo("body");

	$("#frmCreateCustomVast").submit(function (e) {
		e.preventDefault();
		ajaxPOST(
			settings.url,
			$(this).serialize(),
			function (res) {
				if (res.status !== "fail") {
					$("#txtCustomVastResult").val(res.result);
					swalSuccess(res.message);
				} else {
					swalError(res.message);
				}
				$("#customVastResult").toggleClass("d-none");
			},
			function (xhr) {
				swalError(xhr.responseText);
			}
		);
	});

	$("#frmLicense").submit(function (e) {
		e.preventDefault();
		ajaxPOST(
			settings.url,
			$(this).serialize(),
			function (res) {
				$("#frmLicense")[0].remove();
				swalSuccess(res.message);
			},
			function (xhr) {
				swalError(xhr.responseText);
			}
		);
	});
	/**
	 * settings end
	 */

	/**
	 * subtitles start
	 */
	$("#modalHostSub").detach().appendTo("body");
	$("#mdUploadSubtitle").detach().appendTo("body");
	subtitles.list();
	/**
	 * subtitles end
	 */

	/**
	 * sessions start
	 */
	sessions.list();
	/**
	 * sessions end
	 */

	/**
	 * users start
	 */
	$("#modalUserStats").detach().appendTo("body");
	$("#modalUserStats").on("hidden.bs.modal", function () {
		$("#modalUserStats").find("#statUserID").val("");
	});
	$("#modalUserStats").on("shown.bs.modal", function () {
		var uid = $("#modalUserStats #statUserID").val();
		users.stats.recentVideos(uid);
		users.stats.popularVideos(uid);
		users.stats.videosStatus(uid);
		dashboard.chart.views.load(
			$('#userViews input[name="options"]:checked').val(),
			uid,
			document.querySelector("#userViews > .chart")
		);
	});
	$('#userViews input[name="options"]').change(function () {
		dashboard.chart.views.load(
			$(this).val(),
			$("#modalUserStats #statUserID").val(),
			document.querySelector("#userViews > .chart")
		);
	});
	users.list();
	var $userRetypePwd = $("#frmUser #retype_password"),
		$userPwd = $("#frmUser #password");
	$userPwd.change(function () {
		if ($(this).val() !== "") {
			$(this).prop("required", true);
			$userRetypePwd.prop("required", true);
		} else {
			$(this).prop("required", false);
			$userRetypePwd.prop("required", false);
		}
	});
	$userRetypePwd.change(function () {
		var el = "#frmUser #retype_password";
		if ($(this).val() !== $userPwd.val()) {
			matchValidation(
				el,
				"The confirm new password must be the same as the new password"
			);
		} else {
			matchValidation(el, "");
		}
	});
	/**
	 * users end
	 */

	/**
	 * videos start
	 */
	videos.init();
	/**
	 * videos end
	 */

	/**
	 * frontpage start
	 */
	$("#frmCreatePlayer").on("submit", function (e) {
		e.preventDefault();
		var $captcha = $("#g-recaptcha-response"),
			sumbitCreatePlayer = function () {
				var $frm = $("#frmCreatePlayer"),
					$result = $("#createPlayerResult"),
					$btn = $frm.find("#submit"),
					data = new FormData($frm[0]),
					btnText = $btn.html();

				$btn.html(main.spinner).prop("disabled", true);
				$result.addClass("d-none");
				$("#embedIframe").attr("src", "");

				data.append("action", "createPlayer");
				$.ajax({
					type: "POST",
					url: "ajax/",
					contentType: false,
					processData: false,
					cache: false,
					data: data,
					success: function (res) {
						if (res.status !== "fail") {
							$("#txtEmbed").val(res.result.embed_url);
							$("#txtEmbedCode").val(res.result.embed_code);
							$("#txtDl").val(res.result.download_url);
							$("#txtReq").val(res.result.request_url);
							$("#embedIframe").attr("src", res.result.embed_url);
							$result.removeClass("d-none");
						} else {
							swalError(res.message);
						}
					},
					error: function (xhr) {
						swalError(xhr.responseText);
					},
					complete: function () {
						$frm[0].reset();
						$btn.html(btnText).prop("disabled", false);
						if ("recaptchaReset" in window) {
							recaptchaReset();
						}
					},
				});
			};
		if (
			$captcha.length &&
			!window.sStorage.getItem("g-recaptcha-response")
		) {
			if ("recaptchaReset" in window) {
                recaptchaReset();
            }
			swalQuestion(
				"Info",
				"The security code has expired. Please try again",
				function (isConfirm) {
					if (!isConfirm) return;
					sumbitCreatePlayer();
				}
			);
			return false;
		}
		sumbitCreatePlayer();
	});

	$("#frmBypassLimit").on("submit", function (e) {
		e.preventDefault();
		var $captcha = $("#g-recaptcha-response"),
			submitBypassLimit = function () {
				var $frm = $("#frmBypassLimit"),
					$input = $("#txtGDriveDL"),
					$btn = $frm.find("#submit"),
					btnText = $btn.html();
				$.ajax({
					url: "ajax/",
					method: "POST",
					dataType: "json",
					cache: false,
					data: $frm.serialize(),
					beforeSend: function () {
						$btn.html(main.spinner).prop("disabled", true);
						$input.attr("data-id", "");
					},
					success: function (res) {
						if (res.status !== "fail") {
							$input
								.attr("data-id", res.result.id)
								.val(res.result.link);
							swalSuccess(res.message);
						} else {
							swalError(res.message);
						}
					},
					error: function (xhr) {
						swalError(xhr.responseText);
					},
					complete: function () {
						$btn.html(btnText).prop("disabled", false);
						if ("recaptchaReset" in window) {
							recaptchaReset();
						}
					},
				});
			};
		if (
			$captcha.length &&
			!window.sStorage.getItem("g-recaptcha-response")
		) {
			if ("recaptchaReset" in window) {
                recaptchaReset();
            }
			swalQuestion(
				"Info",
				"The security code has expired. Please try again",
				function (isConfirm) {
					if (!isConfirm) return;
					submitBypassLimit();
				}
			);
			return false;
		}
		submitBypassLimit();
	});

	if (
		typeof oldDBVersion !== "undefined" &&
		typeof newDBVersion !== "undefined" &&
		oldDBVersion !== newDBVersion
	) {
		var createModalUpdate = function () {
				var $md = $("body").find("#updateModal");
				if ($md.length == 0) {
					$("body").append(
						'<div class="modal" id="updateModal" data-backdrop="static" data-keyboard="false" tabindex="-1" aria-labelledby="updateModalLabel" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="updateModalLabel">Update Progress</h5></div><div class="modal-body"><p>Progressed Number: <span id="updateNumber">0</span> of <span id="updateTotal">0</span></p></p><div class="progress" style="height:20px"><div id="updateProgress" class="progress-bar" role="progressbar" style="width:0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="0">0%</div></div></div></div></div></div>'
					);
					$md.on("hidden.bs.modal", function () {
						$md.remove();
					});
				}
				return $md;
			},
			updateChecker = function () {
				$.ajax({
					url: adminURL + "ajax/?action=updateChecker",
                    cache: false,
					success: function (res) {
						var percent = 0,
							$dialog = createModalUpdate();
						if (res.status !== "fail") {
							$dialog.modal("show");
							percent = parseInt(
								(res.result.number / res.result.total) * 100
							);
							if (res.result.number === 0) {
								updateNow();
							}
							percent += "%";
							$dialog
								.find("#updateProgress")
								.attr("aria-valuemax", res.result.total);
							$dialog
								.find("#updateNumber")
								.text(res.result.number);
							$dialog.find("#updateTotal").text(res.result.total);
							$dialog
								.find("#updateProgress")
								.attr("aria-valuenow", res.result.number)
								.css("width", percent)
								.text(percent);
							if (
								res.result.number > 0 &&
								res.result.number >= res.result.total
							) {
								$dialog.modal("hide");
							} else {
								updateChecker();
							}
						}
					},
				});
			};
		updateChecker();
	}
	/**
	 * frontpage end
	 */
});

function checkSingle($ck, tableId) {
	var $tb = $(document).find(tableId),
		$btn = $(document)
			.find(tableId + "_wrapper")
			.prevAll(".toolbar")
			.find(".btn-hidden");
	if ($tb.find("tbody input[type=checkbox]:checked").length) {
		$btn.removeClass("d-none");
		$tb.find("thead input[type=checkbox], tfoot input[type=checkbox]").prop(
			"indeterminate",
			true
		);
	} else {
		$btn.addClass("d-none");
		$tb.find("input[type=checkbox]").prop("checked", false);
	}
}

function checkAll($ck, tableId) {
	var $tb = $(document).find(tableId),
		$btn = $(document)
			.find(tableId + "_wrapper")
			.prevAll(".toolbar")
			.find(".btn-hidden");
	$tb.find("input[type=checkbox]").prop("checked", $ck.prop("checked"));
	if ($tb.find("tbody input[type=checkbox]:checked").length) {
		$btn.removeClass("d-none");
	} else {
		$btn.addClass("d-none");
		$tb.find("input[type=checkbox]").prop("checked", false);
	}
}

function capitalizeWords(str) {
	return str.replace(/\b\w/g, function (char) {
		return char.toUpperCase();
	});
}

function getMonthName(monthIndex) {
	var months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	return months[monthIndex];
}

function formatTimestamp(timestamp) {
	if (timestamp != null && timestamp > 1000) {
		var date = new Date(timestamp * 1000),
			month = getMonthName(date.getMonth()),
			day = date.getDate(),
			year = date.getFullYear(),
			hours = date.getHours().toString().padStart(2, "0"),
			minutes = date.getMinutes().toString().padStart(2, "0");
		return month + " " + day + ", " + year + " " + hours + ":" + minutes;
	}
	return "";
}

function gdriveViewLink(gdrive_id) {
	return (
		'<a href="https://drive.google.com/file/d/' +
		gdrive_id +
		'/view?usp=drivesdk" target="_blank">' +
		gdrive_id +
		"</a>"
	);
}

function updateNow() {
	$.ajax({
		url: "ajax/?action=updateNow",
		timeout: 300000,
	});
}

function searchHost(txt) {
	var $list = $("#tbHost tbody tr");
	$list.each(function (i, e) {
		if (
			$(e).data("host").toLowerCase().indexOf(txt) > -1 ||
			$(e).html().toLowerCase().indexOf(txt) > -1
		) {
			$(e).removeClass("d-none");
		} else {
			$(e).addClass("d-none");
		}
	});
}

function swalQuestion(msgTitle, msgText, callback) {
	swal(
		{
			title: msgTitle,
			text: msgText,
			type: "warning",
			showLoaderOnConfirm: true,
			showCancelButton: true,
			cancelButtonClass: "btn-secondary",
			confirmButtonClass: "btn-danger",
			closeOnConfirm: false,
		},
		callback
	);
}

function swalSuccess(msg) {
	swal("Success!", msg, "success");
}

function swalError(msg) {
	swal("Error!", msg, "error");
}

function swalInfo(msg) {
	swal("Info!", msg, "info");
}

function swalWarning(msg) {
	swal("Warning!", msg, "warning");
}

function ajaxValidation(el, msg) {
	var $this = document.querySelector(el);
	if (msg !== "") {
		$this.setAttribute("data-error-ajax", msg);
	} else {
		$this.removeAttribute("data-error-ajax");
	}
	$this.setCustomValidity(msg);
}

function matchValidation(el, msg) {
	var $this = document.querySelector(el);
	if (msg !== "") {
		$this.setAttribute("data-error-match", msg);
	} else {
		$this.removeAttribute("data-error-match");
	}
	$this.setCustomValidity(msg);
}

function multiSelectOptions() {
	var multiSelectSearch =
			"<input type='search' class='form-control form-control-sm' autocomplete='off' placeholder='Search'>",
		multiSelectOptions = {
			keepOrder: true,
			selectableHeader: multiSelectSearch,
			selectionHeader: multiSelectSearch,
			afterInit: function (ms) {
				var that = this,
					id = "#" + that.$container.attr("id"),
					$leftSearch = that.$selectableUl.prev(),
					$rightSearch = that.$selectionUl.prev(),
					leftList = id + " .ms-elem-selectable:not(.ms-selected)",
					rightList = id + " .ms-elem-selection.ms-selected";

				$leftSearch.on("blur keyup", function (e) {
					var txt = $(this).val().toLowerCase();
					if (txt !== "") {
						$(leftList).each(function () {
							var item = $(this).text().toLowerCase();
							if (item.indexOf(txt) > -1) {
								$(this).removeClass("d-none");
							} else {
								$(this).addClass("d-none");
							}
						});
					} else {
						$(leftList).removeClass("d-none");
					}
				});

				$rightSearch.on("blur keyup", function (e) {
					var txt = $(this).val().toLowerCase();
					if (txt !== "") {
						$(rightList).each(function () {
							var item = $(this).text().toLowerCase();
							if (item.indexOf(txt) > -1) {
								$(this).removeClass("d-none");
							} else {
								$(this).addClass("d-none");
							}
						});
					} else {
						$(rightList).removeClass("d-none");
					}
				});
			},
		};
	return multiSelectOptions;
}

function copyText(text, name) {
	var textarea = document.createElement("textarea");
	textarea.textContent = text;
	document.body.appendChild(textarea);

	var range = document.createRange();
	range.selectNode(textarea);

	var selection = document.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);

	console.log("copy success", document.execCommand("copy"));
	selection.removeAllRanges();

	document.body.removeChild(textarea);

	name =
		typeof name !== "undefined" && name !== "" && name !== null
			? name
			: "Embed code";
	showToast(name + " has been copied.", "success");
}

function loadTooltip() {
	$('[data-toggle="tooltip"], [data-tooltip="true"]').tooltip({
		container: "body",
	});
	$('[data-toggle="tooltip"], [data-tooltip="true"]').on(
		"show.bs.tooltip",
		function () {
			$('body > [role="tooltip"]').remove();
		}
	);
}

function loadSelect2() {
	if (typeof $.fn.select2 !== "undefined") {
		$(".select2").select2({ theme: "bootstrap4" });
	}
}

function loadStyle(url, onloadCallback) {
	var e = document.createElement("link");
	e.href = url;
	e.type = "text/css";
	e.rel = "stylesheet";
	if (typeof onloadCallback !== "undefined") {
		e.onload = onloadCallback;
	}
	document.getElementsByTagName("head")[0].appendChild(e);
}

function require(url, onloadCallback) {
	var e = document.createElement("script");
	e.src = url;
	e.type = "text/javascript";
	if (typeof onloadCallback !== "undefined") {
		e.onload = onloadCallback;
	}
	document.getElementsByTagName("head")[0].appendChild(e);
}

function $_GET(key) {
	key = key.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + key + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(window.location.href);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function showVideosExport() {
	var $ck = $("#tbVideos tbody input[type=checkbox]:checked"),
		$this = $("#mdVideosExport"),
		$dl = $this.find("#dl textarea"),
		$el = $this.find("#el textarea"),
		$embed = $this.find("#embed textarea"),
		$bbc = $this.find("#bb textarea"),
		$html = $this.find("#html textarea"),
		$rw,
		$mn,
		dl = "",
		el = "",
		title = "",
		embed = "",
		html = "";
	$this.find("textarea").val("");
	$ck.each(function (i, e) {
		$rw = $("#tbVideos tbody tr#" + $(e).val());
		$mn = $rw.find(".dropdown-menu .dropdown-item");
		dl = $mn.eq(2).attr("href") + "\n\n";
		el = $mn.eq(1).attr("href") + "\n\n";
		embed = $mn.eq(0).data("text") + "\n\n";
		title = $rw.find(".title").text();
		title = title !== "" ? title : "(No Title)";
		if ($this.find("#show_title").prop("checked")) {
			$dl.val($dl.val() + title + ": " + dl);
			$el.val($el.val() + title + ": " + el);
			$embed.val($embed.val() + title + "\n" + embed);
			$bbc.val(
				$bbc.val() +
					"[URL=" +
					el.replace("\n\n", "") +
					"]" +
					title +
					"[/URL]\n\n"
			);
		} else {
			$dl.val($dl.val() + dl);
			$el.val($el.val() + el);
			$embed.val($embed.val() + embed);
			$bbc.val(
				$bbc.val() + "[URL]" + el.replace("\n\n", "") + "[/URL]\n\n"
			);
		}
		$html.val(
			$html.val() +
				'<a href="' +
				el.replace("\n\n", "") +
				'" target="_blank">' +
				title +
				"</a>\n\n"
		);
	});
}

function showToast(text, type, opts) {
	var def = {
			text: text.replace(/\+/gi, " "),
			duration: 5000,
			close: true,
			gravity: "top",
			position: "right",
			stopOnFocus: true,
			callback: function () {
				Cookies.remove("adm-type", main.cookieConfig);
				Cookies.remove("adm-message", main.cookieConfig);
			},
		},
		style = {
			info: {
				style: {
					background: "linear-gradient(to right, #5477f5, #73a5ff)",
				},
			},
			warning: {
				style: {
					background: "linear-gradient(to right, #ff9800, #ffc107)",
				},
				className: "text-dark",
			},
			danger: {
				style: {
					background: "linear-gradient(to right, #e91e63, #f44336)",
				},
			},
			success: {
				style: {
					background: "linear-gradient(to right, #009688, #4caf50)",
				},
			},
			error: {
				style: {
					background: "linear-gradient(to right, #e91e63, #f44336)",
				},
			},
		};
	$('body div[role="tooltip"]').remove();
	if (typeof Toastify !== "undefined") {
		Toastify(Object.assign(def, style[type], opts)).showToast();
	}
}

function ajaxGET(url, sCallback, eCallback) {
	var c = url.indexOf("/api") > -1 ? false : true;
	$.ajax({
		url: url,
		type: "GET",
		cache: c,
		success: sCallback,
		error: eCallback,
	});
}

function ajaxPOST(url, data, sCallback, eCallback, bsCallback) {
	var c = url.indexOf("/api") > -1 ? false : true,
		cSuccess =
			typeof sCallback === "function" ? sCallback : function (res) {},
		cError =
			typeof eCallback === "function" ? eCallback : function (xhr) {},
		cBeforeSend =
			typeof bsCallback === "function" ? bsCallback : function (xhr) {};
	$.ajax({
		url: url,
		type: "POST",
		cache: c,
		data: data,
		beforeSend: cBeforeSend,
		success: cSuccess,
		error: cError,
	});
}

function btnCog() {
	return '<button type="button" class="btn btn-sm btn-custom dropdown-toggle" data-bs-toggle="dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="fas fa-cog"></i></button>';
}

function btnDownload(hrefValue) {
	return (
		'<a class="dropdown-item" href="' +
		hrefValue +
		'" target="_blank"><i class="fas fa-download mr-2 me-2"></i>Download URL</a>'
	);
}

function btnEmbed(hrefValue) {
	return (
		'<a class="dropdown-item" href="' +
		hrefValue +
		'" target="_blank"><i class="fas fa-link mr-2 me-2"></i>Embed URL</a>'
	);
}

function btnEditItem(hrefValue) {
	return (
		'<a href="' +
		hrefValue +
		'" class="dropdown-item" type="button"><i class="fas fa-edit mr-2 me-2"></i>Edit</a>'
	);
}

function btnCopyEmbed(text) {
	return (
		'<button class="dropdown-item copy-embed" data-text="' +
		text +
		'"><i class="fas fa-code mr-2 me-2"></i>Copy Embed Code</button>'
	);
}

function btnDeleteItem(id, name) {
	return (
		'<button class="dropdown-item delete" data-id="' +
		id +
		'" data-name="' +
		name +
		'" type="button"><i class="fas fa-trash mr-2 me-2"></i>Delete</button>'
	);
}

function notRecovered() {
	return "Deleted data cannot be recovered.";
}

function btnCheckbox(value, name, tableId) {
	return (
		'<div class="custom-control custom-checkbox mx-auto"><input type="checkbox" class="custom-control-input" id="' +
		name +
		"-" +
		value +
		'" value="' +
		value +
		'" onchange="checkSingle($(this), \'' +
		tableId +
		'\')"><label class="custom-control-label" for="' +
		name +
		"-" +
		value +
		'"></label></div>'
	);
}

(function () {
	"use strict";
	window.addEventListener(
		"load",
		function () {
			var jqValidation = function (elements, index) {
					var errorHTML = function (type, newText, $e) {
						var text = $e.html();
						$e.html(
							"<span id='error-" +
								index +
								"-" +
								type +
								"'>" +
								text +
								(text !== "" ? "<br>" : "") +
								newText +
								"</span>"
						);
					};
					if (elements.length) {
						$.each(elements, function (i, e) {
							var $el = $(this),
								$err = $el.next(".invalid-feedback"),
								val = $el.val(),
								min = $el.attr("min"),
								max = $el.attr("max"),
								pattern = new RegExp($el.attr("pattern")),
								msgId = "span#error-" + index + "-" + i + "-";
							if ($err.length === 0) {
								$err = $el
									.closest(".input-group")
									.find(".invalid-feedback");
							}
							if ($el.is(":invalid")) {
								$err.html("");
								$.each(e.dataset, function (j, f) {
									j = j.replace("error", "");
									if (j === "Required") {
										if (val === "")
											errorHTML(j + "-" + i, f, $err);
										else $(msgId + j).remove();
									}
									if (j === "Min") {
										if (
											typeof min !== "number" ||
											parseFloat(val) < parseFloat(min)
										)
											errorHTML(j + "-" + i, f, $err);
										else $(msgId + j).remove();
									}
									if (j === "Max") {
										if (
											typeof max !== "number" ||
											parseFloat(val) > parseFloat(max)
										)
											errorHTML(j + "-" + i, f, $err);
										else $(msgId + j).remove();
									}
									if (j === "Pattern") {
										if (!pattern.test(val))
											errorHTML(j + "-" + i, f, $err);
										else $(msgId + j).remove();
									}
									if (j === "Ajax") {
										if (f !== "")
											errorHTML(j + "-" + i, f, $err);
										else $(msgId + j).remove();
									}
									if (j === "Match") {
										if (f !== "")
											errorHTML(j + "-" + i, f, $err);
										else $(msgId + j).remove();
									}
								});
							}
						});
					}
				},
				forms = document.getElementsByClassName("needs-validation");
			Array.prototype.filter.call(forms, function (form, index) {
				form.addEventListener(
					"submit",
					function (e) {
						if (form.checkValidity() === false) {
							e.preventDefault();
							e.stopPropagation();
						}
						form.classList.add("was-validated");
						jqValidation(form.elements, index);
					},
					false
				);
			});
		},
		false
	);
})();
