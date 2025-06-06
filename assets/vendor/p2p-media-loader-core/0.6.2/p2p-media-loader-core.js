require = (function () {
	function r(e, n, t) {
		function o(i, f) {
			if (!n[i]) {
				if (!e[i]) {
					var c = "function" == typeof require && require;
					if (!f && c) return c(i, !0);
					if (u) return u(i, !0);
					var a = new Error("Cannot find module '" + i + "'");
					throw ((a.code = "MODULE_NOT_FOUND"), a);
				}
				var p = (n[i] = { exports: {} });
				e[i][0].call(
					p.exports,
					function (r) {
						var n = e[i][1][r];
						return o(n || r);
					},
					p,
					p.exports,
					r,
					e,
					n,
					t
				);
			}
			return n[i].exports;
		}
		for (
			var u = "function" == typeof require && require, i = 0;
			i < t.length;
			i++
		)
			o(t[i]);
		return o;
	}
	return r;
})()(
	{
		1: [
			function (require, module, exports) {
				"use strict";
				/**
				 * Copyright 2018 Novage LLC.
				 *
				 * Licensed under the Apache License, Version 2.0 (the "License");
				 * you may not use this file except in compliance with the License.
				 * You may obtain a copy of the License at
				 *
				 *     http://www.apache.org/licenses/LICENSE-2.0
				 *
				 * Unless required by applicable law or agreed to in writing, software
				 * distributed under the License is distributed on an "AS IS" BASIS,
				 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				 * See the License for the specific language governing permissions and
				 * limitations under the License.
				 */
				Object.defineProperty(exports, "__esModule", { value: true });
				const SMOOTH_INTERVAL = 1 * 1000;
				const MEASURE_INTERVAL = 60 * 1000;
				class NumberWithTime {
					constructor(value, timeStamp) {
						this.value = value;
						this.timeStamp = timeStamp;
					}
				}
				class BandwidthApproximator {
					constructor() {
						this.lastBytes = [];
						this.currentBytesSum = 0;
						this.lastBandwidth = [];
					}
					addBytes(bytes, timeStamp) {
						this.lastBytes.push(
							new NumberWithTime(bytes, timeStamp)
						);
						this.currentBytesSum += bytes;
						while (
							timeStamp - this.lastBytes[0].timeStamp >
							SMOOTH_INTERVAL
						) {
							this.currentBytesSum -=
								this.lastBytes.shift().value;
						}
						this.lastBandwidth.push(
							new NumberWithTime(
								this.currentBytesSum / SMOOTH_INTERVAL,
								timeStamp
							)
						);
					}
					// in bytes per millisecond
					getBandwidth(timeStamp) {
						while (
							this.lastBandwidth.length != 0 &&
							timeStamp - this.lastBandwidth[0].timeStamp >
								MEASURE_INTERVAL
						) {
							this.lastBandwidth.shift();
						}
						let maxBandwidth = 0;
						for (const bandwidth of this.lastBandwidth) {
							if (bandwidth.value > maxBandwidth) {
								maxBandwidth = bandwidth.value;
							}
						}
						return maxBandwidth;
					}
					getSmoothInterval() {
						return SMOOTH_INTERVAL;
					}
					getMeasureInterval() {
						return MEASURE_INTERVAL;
					}
				}
				exports.BandwidthApproximator = BandwidthApproximator;
			},
			{},
		],
		2: [
			function (require, module, exports) {
				/**
				 * Copyright 2018 Novage LLC.
				 *
				 * Licensed under the Apache License, Version 2.0 (the "License");
				 * you may not use this file except in compliance with the License.
				 * You may obtain a copy of the License at
				 *
				 *     http://www.apache.org/licenses/LICENSE-2.0
				 *
				 * Unless required by applicable law or agreed to in writing, software
				 * distributed under the License is distributed on an "AS IS" BASIS,
				 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				 * See the License for the specific language governing permissions and
				 * limitations under the License.
				 */

				if (!window.p2pml) {
					window.p2pml = {};
				}

				window.p2pml.core = require("./index");
			},
			{ "./index": "p2p-media-loader-core" },
		],
		3: [
			function (require, module, exports) {
				"use strict";
				/**
				 * Copyright 2018 Novage LLC.
				 *
				 * Licensed under the Apache License, Version 2.0 (the "License");
				 * you may not use this file except in compliance with the License.
				 * You may obtain a copy of the License at
				 *
				 *     http://www.apache.org/licenses/LICENSE-2.0
				 *
				 * Unless required by applicable law or agreed to in writing, software
				 * distributed under the License is distributed on an "AS IS" BASIS,
				 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				 * See the License for the specific language governing permissions and
				 * limitations under the License.
				 */
				Object.defineProperty(exports, "__esModule", { value: true });
				const Debug = require("debug");
				const stringly_typed_event_emitter_1 = require("./stringly-typed-event-emitter");
				class HttpMediaManager extends stringly_typed_event_emitter_1.STEEmitter {
					constructor(settings) {
						super();
						this.settings = settings;
						this.xhrRequests = new Map();
						this.failedSegments = new Map();
						this.debug = Debug("p2pml:http-media-manager");
						this.now = () => performance.now();
					}
					download(segment, downloadedPieces) {
						if (this.isDownloading(segment)) {
							return;
						}
						this.cleanTimedOutFailedSegments();
						const segmentUrl = this.settings.segmentUrlBuilder
							? this.settings.segmentUrlBuilder(segment)
							: segment.url;
						this.debug("http segment download", segmentUrl);
						segment.requestUrl = segmentUrl;
						const xhr = new XMLHttpRequest();
						xhr.open("GET", segmentUrl, true);
						xhr.responseType = "arraybuffer";
						if (segment.range) {
							xhr.setRequestHeader("Range", segment.range);
							downloadedPieces = undefined; // TODO: process downloadedPieces for segments with range headers too
						} else if (
							downloadedPieces !== undefined &&
							this.settings.httpUseRanges
						) {
							let bytesDownloaded = 0;
							for (const piece of downloadedPieces) {
								bytesDownloaded += piece.byteLength;
							}
							xhr.setRequestHeader(
								"Range",
								`bytes=${bytesDownloaded}-`
							);
							this.debug(
								"continue download from",
								bytesDownloaded
							);
						} else {
							downloadedPieces = undefined;
						}
						this.setupXhrEvents(xhr, segment, downloadedPieces);
						if (this.settings.xhrSetup) {
							this.settings.xhrSetup(xhr, segmentUrl);
						}
						this.xhrRequests.set(segment.id, { xhr, segment });
						xhr.send();
					}
					abort(segment) {
						const request = this.xhrRequests.get(segment.id);
						if (request) {
							request.xhr.abort();
							this.xhrRequests.delete(segment.id);
							this.debug("http segment abort", segment.id);
						}
					}
					isDownloading(segment) {
						return this.xhrRequests.has(segment.id);
					}
					isFailed(segment) {
						const time = this.failedSegments.get(segment.id);
						return time !== undefined && time > this.now();
					}
					getActiveDownloads() {
						return this.xhrRequests;
					}
					getActiveDownloadsCount() {
						return this.xhrRequests.size;
					}
					destroy() {
						this.xhrRequests.forEach((request) =>
							request.xhr.abort()
						);
						this.xhrRequests.clear();
					}
					setupXhrEvents(xhr, segment, downloadedPieces) {
						let prevBytesLoaded = 0;
						xhr.addEventListener("progress", (event) => {
							const bytesLoaded = event.loaded - prevBytesLoaded;
							this.emit("bytes-downloaded", bytesLoaded);
							prevBytesLoaded = event.loaded;
						});
						xhr.addEventListener("load", async (event) => {
							if (
								event.target.status < 200 ||
								event.target.status >= 300
							) {
								this.segmentFailure(segment, event, xhr);
								return;
							}
							let data = event.target.response;
							if (
								downloadedPieces !== undefined &&
								event.target.status === 206
							) {
								let bytesDownloaded = 0;
								for (const piece of downloadedPieces) {
									bytesDownloaded += piece.byteLength;
								}
								const segmentData = new Uint8Array(
									bytesDownloaded + data.byteLength
								);
								let offset = 0;
								for (const piece of downloadedPieces) {
									segmentData.set(
										new Uint8Array(piece),
										offset
									);
									offset += piece.byteLength;
								}
								segmentData.set(new Uint8Array(data), offset);
								data = segmentData.buffer;
							}
							await this.segmentDownloadFinished(
								segment,
								data,
								xhr
							);
						});
						xhr.addEventListener("error", (event) => {
							this.segmentFailure(segment, event, xhr);
						});
						xhr.addEventListener("timeout", (event) => {
							this.segmentFailure(segment, event, xhr);
						});
					}
					async segmentDownloadFinished(segment, data, xhr) {
						segment.responseUrl =
							xhr.responseURL === null
								? undefined
								: xhr.responseURL;
						if (this.settings.segmentValidator) {
							try {
								await this.settings.segmentValidator(
									Object.assign(Object.assign({}, segment), {
										data: data,
									}),
									"http"
								);
							} catch (error) {
								this.debug("segment validator failed", error);
								this.segmentFailure(segment, error, xhr);
								return;
							}
						}
						this.xhrRequests.delete(segment.id);
						this.emit("segment-loaded", segment, data);
					}
					segmentFailure(segment, error, xhr) {
						segment.responseUrl =
							xhr.responseURL === null
								? undefined
								: xhr.responseURL;
						this.xhrRequests.delete(segment.id);
						this.failedSegments.set(
							segment.id,
							this.now() + this.settings.httpFailedSegmentTimeout
						);
						this.emit("segment-error", segment, error);
					}
					cleanTimedOutFailedSegments() {
						const now = this.now();
						const candidates = [];
						this.failedSegments.forEach((time, id) => {
							if (time < now) {
								candidates.push(id);
							}
						});
						candidates.forEach((id) =>
							this.failedSegments.delete(id)
						);
					}
				}
				exports.HttpMediaManager = HttpMediaManager;
			},
			{ "./stringly-typed-event-emitter": 9, debug: "debug" },
		],
		4: [
			function (require, module, exports) {
				"use strict";
				/**
				 * Copyright 2018 Novage LLC.
				 *
				 * Licensed under the Apache License, Version 2.0 (the "License");
				 * you may not use this file except in compliance with the License.
				 * You may obtain a copy of the License at
				 *
				 *     http://www.apache.org/licenses/LICENSE-2.0
				 *
				 * Unless required by applicable law or agreed to in writing, software
				 * distributed under the License is distributed on an "AS IS" BASIS,
				 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				 * See the License for the specific language governing permissions and
				 * limitations under the License.
				 */
				Object.defineProperty(exports, "__esModule", { value: true });
				const Debug = require("debug");
				const loader_interface_1 = require("./loader-interface");
				const events_1 = require("events");
				const http_media_manager_1 = require("./http-media-manager");
				const p2p_media_manager_1 = require("./p2p-media-manager");
				const media_peer_1 = require("./media-peer");
				const bandwidth_approximator_1 = require("./bandwidth-approximator");
				const segments_memory_storage_1 = require("./segments-memory-storage");
				const getBrowserRTC = require("get-browser-rtc");
				const Peer = require("simple-peer");
				const defaultSettings = {
					cachedSegmentExpiration: 5 * 60 * 1000,
					cachedSegmentsCount: 30,
					useP2P: true,
					consumeOnly: false,
					requiredSegmentsPriority: 1,
					simultaneousHttpDownloads: 2,
					httpDownloadProbability: 0.1,
					httpDownloadProbabilityInterval: 1000,
					httpDownloadProbabilitySkipIfNoPeers: false,
					httpFailedSegmentTimeout: 10000,
					httpDownloadMaxPriority: 20,
					httpDownloadInitialTimeout: 0,
					httpDownloadInitialTimeoutPerSegment: 4000,
					httpUseRanges: false,
					simultaneousP2PDownloads: 3,
					p2pDownloadMaxPriority: 20,
					p2pSegmentDownloadTimeout: 60000,
					webRtcMaxMessageSize: 64 * 1024 - 1,
					trackerAnnounce: [
						"wss://tracker.novage.com.ua",
						"wss://tracker.openwebtorrent.com",
					],
					peerRequestsPerAnnounce: 10,
					rtcConfig: Peer.config,
				};
				class HybridLoader extends events_1.EventEmitter {
					constructor(settings = {}) {
						super();
						this.debug = Debug("p2pml:hybrid-loader");
						this.debugSegments = Debug(
							"p2pml:hybrid-loader-segments"
						);
						this.segmentsQueue = [];
						this.bandwidthApproximator =
							new bandwidth_approximator_1.BandwidthApproximator();
						this.httpDownloadInitialTimeoutTimestamp = -Infinity;
						this.processInitialSegmentTimeout = async () => {
							if (this.httpRandomDownloadInterval === undefined) {
								return; // Instance destroyed
							}
							if (this.masterSwarmId !== undefined) {
								const storageSegments =
									await this.segmentsStorage.getSegmentsMap(
										this.masterSwarmId
									);
								if (
									this.processSegmentsQueue(
										storageSegments
									) &&
									!this.settings.consumeOnly
								) {
									this.p2pManager.sendSegmentsMapToAll(
										this.createSegmentsMap(storageSegments)
									);
								}
							}
							if (
								this.httpDownloadInitialTimeoutTimestamp !==
								-Infinity
							) {
								// Set one more timeout for a next segment
								setTimeout(
									this.processInitialSegmentTimeout,
									this.settings
										.httpDownloadInitialTimeoutPerSegment
								);
							}
						};
						this.downloadRandomSegmentOverHttp = async () => {
							if (
								this.masterSwarmId === undefined ||
								this.httpRandomDownloadInterval === undefined ||
								this.httpDownloadInitialTimeoutTimestamp !==
									-Infinity ||
								this.httpManager.getActiveDownloadsCount() >=
									this.settings.simultaneousHttpDownloads ||
								(this.settings
									.httpDownloadProbabilitySkipIfNoPeers &&
									this.p2pManager.getPeers().size === 0) ||
								this.settings.consumeOnly
							) {
								return;
							}
							const storageSegments =
								await this.segmentsStorage.getSegmentsMap(
									this.masterSwarmId
								);
							const segmentsMap =
								this.p2pManager.getOvrallSegmentsMap();
							const pendingQueue = this.segmentsQueue.filter(
								(s) =>
									!this.p2pManager.isDownloading(s) &&
									!this.httpManager.isDownloading(s) &&
									!segmentsMap.has(s.id) &&
									!this.httpManager.isFailed(s) &&
									s.priority <=
										this.settings.httpDownloadMaxPriority &&
									!storageSegments.has(s.id)
							);
							if (pendingQueue.length == 0) {
								return;
							}
							if (
								Math.random() >
								this.settings.httpDownloadProbability *
									pendingQueue.length
							) {
								return;
							}
							const segment =
								pendingQueue[
									Math.floor(
										Math.random() * pendingQueue.length
									)
								];
							this.debugSegments(
								"HTTP download (random)",
								segment.priority,
								segment.url
							);
							this.httpManager.download(segment);
							this.p2pManager.sendSegmentsMapToAll(
								this.createSegmentsMap(storageSegments)
							);
						};
						this.onPieceBytesDownloaded = (
							method,
							bytes,
							peerId
						) => {
							this.bandwidthApproximator.addBytes(
								bytes,
								this.now()
							);
							this.emit(
								loader_interface_1.Events.PieceBytesDownloaded,
								method,
								bytes,
								peerId
							);
						};
						this.onPieceBytesUploaded = (method, bytes, peerId) => {
							this.emit(
								loader_interface_1.Events.PieceBytesUploaded,
								method,
								bytes,
								peerId
							);
						};
						this.onSegmentLoaded = async (
							segment,
							data,
							peerId
						) => {
							this.debugSegments(
								"segment loaded",
								segment.id,
								segment.url
							);
							if (this.masterSwarmId === undefined) {
								return;
							}
							segment.data = data;
							segment.downloadBandwidth =
								this.bandwidthApproximator.getBandwidth(
									this.now()
								);
							await this.segmentsStorage.storeSegment(segment);
							this.emit(
								loader_interface_1.Events.SegmentLoaded,
								segment,
								peerId
							);
							let storageSegments;
							storageSegments =
								storageSegments === undefined
									? await this.segmentsStorage.getSegmentsMap(
											this.masterSwarmId
									  )
									: storageSegments;
							this.processSegmentsQueue(storageSegments);
							if (!this.settings.consumeOnly) {
								this.p2pManager.sendSegmentsMapToAll(
									this.createSegmentsMap(storageSegments)
								);
							}
						};
						this.onSegmentError = async (
							segment,
							details,
							peerId
						) => {
							this.debugSegments(
								"segment error",
								segment.id,
								segment.url,
								peerId,
								details
							);
							this.emit(
								loader_interface_1.Events.SegmentError,
								segment,
								details,
								peerId
							);
							if (this.masterSwarmId !== undefined) {
								const storageSegments =
									await this.segmentsStorage.getSegmentsMap(
										this.masterSwarmId
									);
								if (
									this.processSegmentsQueue(
										storageSegments
									) &&
									!this.settings.consumeOnly
								) {
									this.p2pManager.sendSegmentsMapToAll(
										this.createSegmentsMap(storageSegments)
									);
								}
							}
						};
						this.onPeerConnect = async (peer) => {
							this.emit(
								loader_interface_1.Events.PeerConnect,
								peer
							);
							if (
								!this.settings.consumeOnly &&
								this.masterSwarmId !== undefined
							) {
								this.p2pManager.sendSegmentsMap(
									peer.id,
									this.createSegmentsMap(
										await this.segmentsStorage.getSegmentsMap(
											this.masterSwarmId
										)
									)
								);
							}
						};
						this.onPeerClose = (peerId) => {
							this.emit(
								loader_interface_1.Events.PeerClose,
								peerId
							);
						};
						this.onTrackerUpdate = async (data) => {
							if (
								this.httpDownloadInitialTimeoutTimestamp !==
									-Infinity &&
								data.incomplete !== undefined &&
								data.incomplete <= 1
							) {
								this.debugSegments(
									"cancel initial HTTP download timeout - no peers"
								);
								this.httpDownloadInitialTimeoutTimestamp =
									-Infinity;
								if (this.masterSwarmId !== undefined) {
									const storageSegments =
										await this.segmentsStorage.getSegmentsMap(
											this.masterSwarmId
										);
									if (
										this.processSegmentsQueue(
											storageSegments
										) &&
										!this.settings.consumeOnly
									) {
										this.p2pManager.sendSegmentsMapToAll(
											this.createSegmentsMap(
												storageSegments
											)
										);
									}
								}
							}
						};
						this.settings = Object.assign(
							Object.assign({}, defaultSettings),
							settings
						);
						if (settings.bufferedSegmentsCount) {
							if (settings.p2pDownloadMaxPriority === undefined) {
								this.settings.p2pDownloadMaxPriority =
									settings.bufferedSegmentsCount;
							}
							if (
								settings.httpDownloadMaxPriority === undefined
							) {
								this.settings.p2pDownloadMaxPriority =
									settings.bufferedSegmentsCount;
							}
							delete this.settings.bufferedSegmentsCount;
						}
						this.segmentsStorage =
							this.settings.segmentsStorage === undefined
								? new segments_memory_storage_1.SegmentsMemoryStorage(
										this.settings
								  )
								: this.settings.segmentsStorage;
						this.debug("loader settings", this.settings);
						this.httpManager = this.createHttpManager();
						this.httpManager.on(
							"segment-loaded",
							this.onSegmentLoaded
						);
						this.httpManager.on(
							"segment-error",
							this.onSegmentError
						);
						this.httpManager.on("bytes-downloaded", (bytes) =>
							this.onPieceBytesDownloaded("http", bytes)
						);
						this.p2pManager = this.createP2PManager();
						this.p2pManager.on(
							"segment-loaded",
							this.onSegmentLoaded
						);
						this.p2pManager.on(
							"segment-error",
							this.onSegmentError
						);
						this.p2pManager.on("peer-data-updated", async () => {
							if (this.masterSwarmId === undefined) {
								return;
							}
							const storageSegments =
								await this.segmentsStorage.getSegmentsMap(
									this.masterSwarmId
								);
							if (
								this.processSegmentsQueue(storageSegments) &&
								!this.settings.consumeOnly
							) {
								this.p2pManager.sendSegmentsMapToAll(
									this.createSegmentsMap(storageSegments)
								);
							}
						});
						this.p2pManager.on(
							"bytes-downloaded",
							(bytes, peerId) =>
								this.onPieceBytesDownloaded(
									"p2p",
									bytes,
									peerId
								)
						);
						this.p2pManager.on("bytes-uploaded", (bytes, peerId) =>
							this.onPieceBytesUploaded("p2p", bytes, peerId)
						);
						this.p2pManager.on(
							"peer-connected",
							this.onPeerConnect
						);
						this.p2pManager.on("peer-closed", this.onPeerClose);
						this.p2pManager.on(
							"tracker-update",
							this.onTrackerUpdate
						);
					}
					static isSupported() {
						const browserRtc = getBrowserRTC();
						return (
							browserRtc &&
							browserRtc.RTCPeerConnection.prototype
								.createDataChannel !== undefined
						);
					}
					createHttpManager() {
						return new http_media_manager_1.HttpMediaManager(
							this.settings
						);
					}
					createP2PManager() {
						return new p2p_media_manager_1.P2PMediaManager(
							this.segmentsStorage,
							this.settings
						);
					}
					async load(segments, streamSwarmId) {
						if (this.httpRandomDownloadInterval === undefined) {
							// Do once on first call
							this.httpRandomDownloadInterval = setInterval(
								this.downloadRandomSegmentOverHttp,
								this.settings.httpDownloadProbabilityInterval
							);
							if (
								this.settings.httpDownloadInitialTimeout > 0 &&
								this.settings
									.httpDownloadInitialTimeoutPerSegment > 0
							) {
								// Initialize initial HTTP download timeout (i.e. download initial segments over P2P)
								this.debugSegments(
									"enable initial HTTP download timeout",
									this.settings.httpDownloadInitialTimeout,
									"per segment",
									this.settings
										.httpDownloadInitialTimeoutPerSegment
								);
								this.httpDownloadInitialTimeoutTimestamp =
									this.now();
								setTimeout(
									this.processInitialSegmentTimeout,
									this.settings
										.httpDownloadInitialTimeoutPerSegment +
										100
								);
							}
						}
						if (segments.length > 0) {
							this.masterSwarmId = segments[0].masterSwarmId;
						}
						if (this.masterSwarmId !== undefined) {
							this.p2pManager.setStreamSwarmId(
								streamSwarmId,
								this.masterSwarmId
							);
						}
						this.debug("load segments");
						let updateSegmentsMap = false;
						// stop all http requests and p2p downloads for segments that are not in the new load
						for (const segment of this.segmentsQueue) {
							if (!segments.find((f) => f.url == segment.url)) {
								this.debug("remove segment", segment.url);
								if (this.httpManager.isDownloading(segment)) {
									updateSegmentsMap = true;
									this.httpManager.abort(segment);
								} else {
									this.p2pManager.abort(segment);
								}
								this.emit(
									loader_interface_1.Events.SegmentAbort,
									segment
								);
							}
						}
						if (this.debug.enabled) {
							for (const segment of segments) {
								if (
									!this.segmentsQueue.find(
										(f) => f.url == segment.url
									)
								) {
									this.debug("add segment", segment.url);
								}
							}
						}
						this.segmentsQueue = segments;
						if (this.masterSwarmId === undefined) {
							return;
						}
						let storageSegments =
							await this.segmentsStorage.getSegmentsMap(
								this.masterSwarmId
							);
						updateSegmentsMap =
							this.processSegmentsQueue(storageSegments) ||
							updateSegmentsMap;
						if (await this.cleanSegmentsStorage()) {
							storageSegments =
								await this.segmentsStorage.getSegmentsMap(
									this.masterSwarmId
								);
							updateSegmentsMap = true;
						}
						if (updateSegmentsMap && !this.settings.consumeOnly) {
							this.p2pManager.sendSegmentsMapToAll(
								this.createSegmentsMap(storageSegments)
							);
						}
					}
					async getSegment(id) {
						return this.masterSwarmId === undefined
							? undefined
							: this.segmentsStorage.getSegment(
									id,
									this.masterSwarmId
							  );
					}
					getSettings() {
						return this.settings;
					}
					getDetails() {
						return {
							peerId: this.p2pManager.getPeerId(),
						};
					}
					async destroy() {
						if (this.httpRandomDownloadInterval !== undefined) {
							clearInterval(this.httpRandomDownloadInterval);
							this.httpRandomDownloadInterval = undefined;
						}
						this.httpDownloadInitialTimeoutTimestamp = -Infinity;
						this.segmentsQueue = [];
						this.httpManager.destroy();
						this.p2pManager.destroy();
						this.masterSwarmId = undefined;
						await this.segmentsStorage.destroy();
					}
					processSegmentsQueue(storageSegments) {
						this.debugSegments(
							"process segments queue. priority",
							this.segmentsQueue.length > 0
								? this.segmentsQueue[0].priority
								: 0
						);
						if (
							this.masterSwarmId === undefined ||
							this.segmentsQueue.length === 0
						) {
							return false;
						}
						let updateSegmentsMap = false;
						let segmentsMap;
						let httpAllowed = true;
						if (
							this.httpDownloadInitialTimeoutTimestamp !==
							-Infinity
						) {
							let firstNotDownloadePriority;
							for (const segment of this.segmentsQueue) {
								if (!storageSegments.has(segment.id)) {
									firstNotDownloadePriority =
										segment.priority;
									break;
								}
							}
							const httpTimeout =
								this.now() -
								this.httpDownloadInitialTimeoutTimestamp;
							httpAllowed =
								httpTimeout >=
									this.settings.httpDownloadInitialTimeout ||
								(firstNotDownloadePriority !== undefined &&
									httpTimeout >
										this.settings
											.httpDownloadInitialTimeoutPerSegment &&
									firstNotDownloadePriority <= 0);
							if (httpAllowed) {
								this.debugSegments(
									"cancel initial HTTP download timeout - timed out"
								);
								this.httpDownloadInitialTimeoutTimestamp =
									-Infinity;
							}
						}
						for (
							let index = 0;
							index < this.segmentsQueue.length;
							index++
						) {
							const segment = this.segmentsQueue[index];
							if (
								storageSegments.has(segment.id) ||
								this.httpManager.isDownloading(segment)
							) {
								continue;
							}
							if (
								segment.priority <=
									this.settings.requiredSegmentsPriority &&
								httpAllowed &&
								!this.httpManager.isFailed(segment)
							) {
								// Download required segments over HTTP
								if (
									this.httpManager.getActiveDownloadsCount() >=
									this.settings.simultaneousHttpDownloads
								) {
									// Not enough HTTP download resources. Abort one of the HTTP downloads.
									for (
										let i = this.segmentsQueue.length - 1;
										i > index;
										i--
									) {
										const segmentToAbort =
											this.segmentsQueue[i];
										if (
											this.httpManager.isDownloading(
												segmentToAbort
											)
										) {
											this.debugSegments(
												"cancel HTTP download",
												segmentToAbort.priority,
												segmentToAbort.url
											);
											this.httpManager.abort(
												segmentToAbort
											);
											break;
										}
									}
								}
								if (
									this.httpManager.getActiveDownloadsCount() <
									this.settings.simultaneousHttpDownloads
								) {
									// Abort P2P download of the required segment if any and force HTTP download
									const downloadedPieces =
										this.p2pManager.abort(segment);
									this.httpManager.download(
										segment,
										downloadedPieces
									);
									this.debugSegments(
										"HTTP download (priority)",
										segment.priority,
										segment.url
									);
									updateSegmentsMap = true;
									continue;
								}
							}
							if (this.p2pManager.isDownloading(segment)) {
								continue;
							}
							if (
								segment.priority <=
								this.settings.requiredSegmentsPriority
							) {
								// Download required segments over P2P
								segmentsMap = segmentsMap
									? segmentsMap
									: this.p2pManager.getOvrallSegmentsMap();
								if (
									segmentsMap.get(segment.id) !==
									media_peer_1.MediaPeerSegmentStatus.Loaded
								) {
									continue;
								}
								if (
									this.p2pManager.getActiveDownloadsCount() >=
									this.settings.simultaneousP2PDownloads
								) {
									// Not enough P2P download resources. Abort one of the P2P downloads.
									for (
										let i = this.segmentsQueue.length - 1;
										i > index;
										i--
									) {
										const segmentToAbort =
											this.segmentsQueue[i];
										if (
											this.p2pManager.isDownloading(
												segmentToAbort
											)
										) {
											this.debugSegments(
												"cancel P2P download",
												segmentToAbort.priority,
												segmentToAbort.url
											);
											this.p2pManager.abort(
												segmentToAbort
											);
											break;
										}
									}
								}
								if (
									this.p2pManager.getActiveDownloadsCount() <
									this.settings.simultaneousP2PDownloads
								) {
									if (this.p2pManager.download(segment)) {
										this.debugSegments(
											"P2P download (priority)",
											segment.priority,
											segment.url
										);
										continue;
									}
								}
								continue;
							}
							if (
								this.p2pManager.getActiveDownloadsCount() <
									this.settings.simultaneousP2PDownloads &&
								segment.priority <=
									this.settings.p2pDownloadMaxPriority
							) {
								if (this.p2pManager.download(segment)) {
									this.debugSegments(
										"P2P download",
										segment.priority,
										segment.url
									);
								}
							}
						}
						return updateSegmentsMap;
					}
					getStreamSwarmId(segment) {
						return segment.streamId === undefined
							? segment.masterSwarmId
							: `${segment.masterSwarmId}+${segment.streamId}`;
					}
					createSegmentsMap(storageSegments) {
						const segmentsMap = {};
						const addSegmentToMap = (segment, status) => {
							const streamSwarmId =
								this.getStreamSwarmId(segment);
							const segmentId = segment.sequence;
							let segmentsIdsAndStatuses =
								segmentsMap[streamSwarmId];
							if (segmentsIdsAndStatuses === undefined) {
								segmentsIdsAndStatuses = ["", []];
								segmentsMap[streamSwarmId] =
									segmentsIdsAndStatuses;
							}
							const segmentsStatuses = segmentsIdsAndStatuses[1];
							segmentsIdsAndStatuses[0] +=
								segmentsStatuses.length == 0
									? segmentId
									: `|${segmentId}`;
							segmentsStatuses.push(status);
						};
						for (const storageSegment of storageSegments.values()) {
							addSegmentToMap(
								storageSegment.segment,
								media_peer_1.MediaPeerSegmentStatus.Loaded
							);
						}
						for (const download of this.httpManager
							.getActiveDownloads()
							.values()) {
							addSegmentToMap(
								download.segment,
								media_peer_1.MediaPeerSegmentStatus
									.LoadingByHttp
							);
						}
						return segmentsMap;
					}
					async cleanSegmentsStorage() {
						if (this.masterSwarmId === undefined) {
							return false;
						}
						return this.segmentsStorage.clean(
							this.masterSwarmId,
							(id) =>
								this.segmentsQueue.find(
									(queueSegment) => queueSegment.id === id
								) !== undefined
						);
					}
					now() {
						return performance.now();
					}
				}
				exports.HybridLoader = HybridLoader;
			},
			{
				"./bandwidth-approximator": 1,
				"./http-media-manager": 3,
				"./loader-interface": 5,
				"./media-peer": 6,
				"./p2p-media-manager": 7,
				"./segments-memory-storage": 8,
				debug: "debug",
				events: "events",
				"get-browser-rtc": 18,
				"simple-peer": 44,
			},
		],
		5: [
			function (require, module, exports) {
				"use strict";
				/**
				 * Copyright 2018 Novage LLC.
				 *
				 * Licensed under the Apache License, Version 2.0 (the "License");
				 * you may not use this file except in compliance with the License.
				 * You may obtain a copy of the License at
				 *
				 *     http://www.apache.org/licenses/LICENSE-2.0
				 *
				 * Unless required by applicable law or agreed to in writing, software
				 * distributed under the License is distributed on an "AS IS" BASIS,
				 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				 * See the License for the specific language governing permissions and
				 * limitations under the License.
				 */
				Object.defineProperty(exports, "__esModule", { value: true });
				var Events;
				(function (Events) {
					/**
					 * Emitted when segment has been downloaded.
					 * Args: segment
					 */
					Events["SegmentLoaded"] = "segment_loaded";
					/**
					 * Emitted when an error occurred while loading the segment.
					 * Args: segment, error
					 */
					Events["SegmentError"] = "segment_error";
					/**
					 * Emitted for each segment that does not hit into a new segments queue when the load() method is called.
					 * Args: segment
					 */
					Events["SegmentAbort"] = "segment_abort";
					/**
					 * Emitted when a peer is connected.
					 * Args: peer
					 */
					Events["PeerConnect"] = "peer_connect";
					/**
					 * Emitted when a peer is disconnected.
					 * Args: peerId
					 */
					Events["PeerClose"] = "peer_close";
					/**
					 * Emitted when a segment piece has been downloaded.
					 * Args: method (can be "http" or "p2p" only), bytes
					 */
					Events["PieceBytesDownloaded"] = "piece_bytes_downloaded";
					/**
					 * Emitted when a segment piece has been uploaded.
					 * Args: method (can be "p2p" only), bytes
					 */
					Events["PieceBytesUploaded"] = "piece_bytes_uploaded";
				})((Events = exports.Events || (exports.Events = {})));
			},
			{},
		],
		6: [
			function (require, module, exports) {
				"use strict";
				/**
				 * Copyright 2018 Novage LLC.
				 *
				 * Licensed under the Apache License, Version 2.0 (the "License");
				 * you may not use this file except in compliance with the License.
				 * You may obtain a copy of the License at
				 *
				 *     http://www.apache.org/licenses/LICENSE-2.0
				 *
				 * Unless required by applicable law or agreed to in writing, software
				 * distributed under the License is distributed on an "AS IS" BASIS,
				 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				 * See the License for the specific language governing permissions and
				 * limitations under the License.
				 */
				Object.defineProperty(exports, "__esModule", { value: true });
				const Debug = require("debug");
				const stringly_typed_event_emitter_1 = require("./stringly-typed-event-emitter");
				const buffer_1 = require("buffer");
				var MediaPeerCommands;
				(function (MediaPeerCommands) {
					MediaPeerCommands[(MediaPeerCommands["SegmentData"] = 0)] =
						"SegmentData";
					MediaPeerCommands[
						(MediaPeerCommands["SegmentAbsent"] = 1)
					] = "SegmentAbsent";
					MediaPeerCommands[(MediaPeerCommands["SegmentsMap"] = 2)] =
						"SegmentsMap";
					MediaPeerCommands[
						(MediaPeerCommands["SegmentRequest"] = 3)
					] = "SegmentRequest";
					MediaPeerCommands[
						(MediaPeerCommands["CancelSegmentRequest"] = 4)
					] = "CancelSegmentRequest";
				})(MediaPeerCommands || (MediaPeerCommands = {}));
				var MediaPeerSegmentStatus;
				(function (MediaPeerSegmentStatus) {
					MediaPeerSegmentStatus[
						(MediaPeerSegmentStatus["Loaded"] = 0)
					] = "Loaded";
					MediaPeerSegmentStatus[
						(MediaPeerSegmentStatus["LoadingByHttp"] = 1)
					] = "LoadingByHttp";
				})(
					(MediaPeerSegmentStatus =
						exports.MediaPeerSegmentStatus ||
						(exports.MediaPeerSegmentStatus = {}))
				);
				class DownloadingSegment {
					constructor(id, size) {
						this.id = id;
						this.size = size;
						this.bytesDownloaded = 0;
						this.pieces = [];
					}
				}
				class MediaPeer extends stringly_typed_event_emitter_1.STEEmitter {
					constructor(peer, settings) {
						super();
						this.peer = peer;
						this.settings = settings;
						this.remoteAddress = "";
						this.downloadingSegmentId = null;
						this.downloadingSegment = null;
						this.segmentsMap = new Map();
						this.debug = Debug("p2pml:media-peer");
						this.timer = null;
						this.onPeerConnect = () => {
							this.debug("peer connect", this.id, this);
							this.remoteAddress = this.peer.remoteAddress;
							this.emit("connect", this);
						};
						this.onPeerClose = () => {
							this.debug("peer close", this.id, this);
							this.terminateSegmentRequest();
							this.emit("close", this);
						};
						this.onPeerError = (error) => {
							this.debug("peer error", this.id, error, this);
						};
						this.onPeerData = (data) => {
							const command = this.getJsonCommand(data);
							if (command == null) {
								this.receiveSegmentPiece(data);
								return;
							}
							if (this.downloadingSegment) {
								this.debug(
									"peer segment download is interrupted by a command",
									this.id,
									this
								);
								const segmentId = this.downloadingSegment.id;
								this.terminateSegmentRequest();
								this.emit(
									"segment-error",
									this,
									segmentId,
									"Segment download is interrupted by a command"
								);
								return;
							}
							this.debug(
								"peer receive command",
								this.id,
								command,
								this
							);
							switch (command.c) {
								case MediaPeerCommands.SegmentsMap:
									this.segmentsMap = this.createSegmentsMap(
										command.m
									);
									this.emit("data-updated");
									break;
								case MediaPeerCommands.SegmentRequest:
									this.emit(
										"segment-request",
										this,
										command.i
									);
									break;
								case MediaPeerCommands.SegmentData:
									if (
										this.downloadingSegmentId === command.i
									) {
										this.downloadingSegment =
											new DownloadingSegment(
												command.i,
												command.s
											);
										this.cancelResponseTimeoutTimer();
									}
									break;
								case MediaPeerCommands.SegmentAbsent:
									if (
										this.downloadingSegmentId === command.i
									) {
										this.terminateSegmentRequest();
										this.segmentsMap.delete(command.i);
										this.emit(
											"segment-absent",
											this,
											command.i
										);
									}
									break;
								case MediaPeerCommands.CancelSegmentRequest:
									// TODO: peer stop sending buffer
									break;
								default:
									break;
							}
						};
						this.peer.on("connect", this.onPeerConnect);
						this.peer.on("close", this.onPeerClose);
						this.peer.on("error", this.onPeerError);
						this.peer.on("data", this.onPeerData);
						this.id = peer.id;
					}
					receiveSegmentPiece(data) {
						if (!this.downloadingSegment) {
							// The segment was not requested or canceled
							this.debug(
								"peer segment not requested",
								this.id,
								this
							);
							return;
						}
						this.downloadingSegment.bytesDownloaded +=
							data.byteLength;
						this.downloadingSegment.pieces.push(data);
						this.emit("bytes-downloaded", this, data.byteLength);
						const segmentId = this.downloadingSegment.id;
						if (
							this.downloadingSegment.bytesDownloaded ==
							this.downloadingSegment.size
						) {
							const segmentData = new Uint8Array(
								this.downloadingSegment.size
							);
							let offset = 0;
							for (const piece of this.downloadingSegment
								.pieces) {
								segmentData.set(new Uint8Array(piece), offset);
								offset += piece.byteLength;
							}
							this.debug(
								"peer segment download done",
								this.id,
								segmentId,
								this
							);
							this.terminateSegmentRequest();
							this.emit(
								"segment-loaded",
								this,
								segmentId,
								segmentData.buffer
							);
						} else if (
							this.downloadingSegment.bytesDownloaded >
							this.downloadingSegment.size
						) {
							this.debug(
								"peer segment download bytes mismatch",
								this.id,
								segmentId,
								this
							);
							this.terminateSegmentRequest();
							this.emit(
								"segment-error",
								this,
								segmentId,
								"Too many bytes received for segment"
							);
						}
					}
					getJsonCommand(data) {
						const bytes = new Uint8Array(data);
						// Serialized JSON string check by first, second and last characters: '{" .... }'
						if (
							bytes[0] == 123 &&
							bytes[1] == 34 &&
							bytes[data.byteLength - 1] == 125
						) {
							try {
								return JSON.parse(
									new TextDecoder().decode(data)
								);
							} catch (_a) {}
						}
						return null;
					}
					createSegmentsMap(segments) {
						if (
							segments == undefined ||
							!(segments instanceof Object)
						) {
							return new Map();
						}
						const segmentsMap = new Map();
						for (const streamSwarmId of Object.keys(segments)) {
							const swarmData = segments[streamSwarmId];
							if (
								!(swarmData instanceof Array) ||
								swarmData.length !== 2 ||
								typeof swarmData[0] !== "string" ||
								!(swarmData[1] instanceof Array)
							) {
								return new Map();
							}
							const segmentsIds = swarmData[0].split("|");
							const segmentsStatuses = swarmData[1];
							if (
								segmentsIds.length !== segmentsStatuses.length
							) {
								return new Map();
							}
							for (let i = 0; i < segmentsIds.length; i++) {
								const segmentStatus = segmentsStatuses[i];
								if (
									typeof segmentStatus !== "number" ||
									MediaPeerSegmentStatus[segmentStatus] ===
										undefined
								) {
									return new Map();
								}
								segmentsMap.set(
									`${streamSwarmId}+${segmentsIds[i]}`,
									segmentStatus
								);
							}
						}
						return segmentsMap;
					}
					sendCommand(command) {
						this.debug("peer send command", this.id, command, this);
						this.peer.write(JSON.stringify(command));
					}
					destroy() {
						this.debug("peer destroy", this.id, this);
						this.terminateSegmentRequest();
						this.peer.destroy();
					}
					getDownloadingSegmentId() {
						return this.downloadingSegmentId;
					}
					getSegmentsMap() {
						return this.segmentsMap;
					}
					sendSegmentsMap(segmentsMap) {
						this.sendCommand({
							c: MediaPeerCommands.SegmentsMap,
							m: segmentsMap,
						});
					}
					sendSegmentData(segmentId, data) {
						this.sendCommand({
							c: MediaPeerCommands.SegmentData,
							i: segmentId,
							s: data.byteLength,
						});
						let bytesLeft = data.byteLength;
						while (bytesLeft > 0) {
							const bytesToSend =
								bytesLeft >= this.settings.webRtcMaxMessageSize
									? this.settings.webRtcMaxMessageSize
									: bytesLeft;
							const buffer = buffer_1.Buffer.from(
								data,
								data.byteLength - bytesLeft,
								bytesToSend
							);
							this.peer.write(buffer);
							bytesLeft -= bytesToSend;
						}
						this.emit("bytes-uploaded", this, data.byteLength);
					}
					sendSegmentAbsent(segmentId) {
						this.sendCommand({
							c: MediaPeerCommands.SegmentAbsent,
							i: segmentId,
						});
					}
					requestSegment(segmentId) {
						if (this.downloadingSegmentId) {
							throw new Error(
								"A segment is already downloading: " +
									this.downloadingSegmentId
							);
						}
						this.sendCommand({
							c: MediaPeerCommands.SegmentRequest,
							i: segmentId,
						});
						this.downloadingSegmentId = segmentId;
						this.runResponseTimeoutTimer();
					}
					cancelSegmentRequest() {
						let downloadingSegment;
						if (this.downloadingSegmentId) {
							const segmentId = this.downloadingSegmentId;
							downloadingSegment = this.downloadingSegment
								? this.downloadingSegment.pieces
								: undefined;
							this.terminateSegmentRequest();
							this.sendCommand({
								c: MediaPeerCommands.CancelSegmentRequest,
								i: segmentId,
							});
						}
						return downloadingSegment;
					}
					runResponseTimeoutTimer() {
						this.timer = setTimeout(() => {
							this.timer = null;
							if (!this.downloadingSegmentId) {
								return;
							}
							const segmentId = this.downloadingSegmentId;
							this.cancelSegmentRequest();
							this.emit("segment-timeout", this, segmentId); // TODO: send peer not responding event
						}, this.settings.p2pSegmentDownloadTimeout);
					}
					cancelResponseTimeoutTimer() {
						if (this.timer) {
							clearTimeout(this.timer);
							this.timer = null;
						}
					}
					terminateSegmentRequest() {
						this.downloadingSegmentId = null;
						this.downloadingSegment = null;
						this.cancelResponseTimeoutTimer();
					}
				}
				exports.MediaPeer = MediaPeer;
			},
			{ "./stringly-typed-event-emitter": 9, buffer: 16, debug: "debug" },
		],
		7: [
			function (require, module, exports) {
				"use strict";
				/**
				 * Copyright 2018 Novage LLC.
				 *
				 * Licensed under the Apache License, Version 2.0 (the "License");
				 * you may not use this file except in compliance with the License.
				 * You may obtain a copy of the License at
				 *
				 *     http://www.apache.org/licenses/LICENSE-2.0
				 *
				 * Unless required by applicable law or agreed to in writing, software
				 * distributed under the License is distributed on an "AS IS" BASIS,
				 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				 * See the License for the specific language governing permissions and
				 * limitations under the License.
				 */
				Object.defineProperty(exports, "__esModule", { value: true });
				const Debug = require("debug");
				const Client = require("bittorrent-tracker/client");
				const stringly_typed_event_emitter_1 = require("./stringly-typed-event-emitter");
				const media_peer_1 = require("./media-peer");
				const buffer_1 = require("buffer");
				const sha1 = require("sha.js/sha1");
				const index_1 = require("./index");
				const PEER_PROTOCOL_VERSION = 2;
				const PEER_ID_VERSION_STRING = index_1.version
					.replace(/\d*./g, (v) =>
						`0${parseInt(v, 10) % 100}`.slice(-2)
					)
					.slice(0, 4);
				const PEER_ID_VERSION_PREFIX = `-WW${PEER_ID_VERSION_STRING}-`; // Using WebTorrent client ID in order to not be banned by websocket trackers
				class PeerSegmentRequest {
					constructor(peerId, segment) {
						this.peerId = peerId;
						this.segment = segment;
					}
				}
				function generatePeerId() {
					const PEER_ID_SYMBOLS =
						"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
					const PEER_ID_LENGTH = 20;
					let peerId = PEER_ID_VERSION_PREFIX;
					for (
						let i = 0;
						i < PEER_ID_LENGTH - PEER_ID_VERSION_PREFIX.length;
						i++
					) {
						peerId += PEER_ID_SYMBOLS.charAt(
							Math.floor(Math.random() * PEER_ID_SYMBOLS.length)
						);
					}
					return new TextEncoder().encode(peerId).buffer;
				}
				class P2PMediaManager extends stringly_typed_event_emitter_1.STEEmitter {
					constructor(sementsStorage, settings) {
						super();
						this.sementsStorage = sementsStorage;
						this.settings = settings;
						this.trackerClient = null;
						this.peers = new Map();
						this.peerCandidates = new Map();
						this.peerSegmentRequests = new Map();
						this.streamSwarmId = null;
						this.debug = Debug("p2pml:p2p-media-manager");
						this.pendingTrackerClient = null;
						this.onTrackerError = (error) => {
							this.debug("tracker error", error);
						};
						this.onTrackerWarning = (warning) => {
							this.debug("tracker warning", warning);
						};
						this.onTrackerUpdate = (data) => {
							this.debug("tracker update", data);
							this.emit("tracker-update", data);
						};
						this.onTrackerPeer = (trackerPeer) => {
							this.debug(
								"tracker peer",
								trackerPeer.id,
								trackerPeer
							);
							if (this.peers.has(trackerPeer.id)) {
								this.debug(
									"tracker peer already connected",
									trackerPeer.id,
									trackerPeer
								);
								trackerPeer.destroy();
								return;
							}
							const peer = new media_peer_1.MediaPeer(
								trackerPeer,
								this.settings
							);
							peer.on("connect", this.onPeerConnect);
							peer.on("close", this.onPeerClose);
							peer.on("data-updated", this.onPeerDataUpdated);
							peer.on("segment-request", this.onSegmentRequest);
							peer.on("segment-loaded", this.onSegmentLoaded);
							peer.on("segment-absent", this.onSegmentAbsent);
							peer.on("segment-error", this.onSegmentError);
							peer.on("segment-timeout", this.onSegmentTimeout);
							peer.on(
								"bytes-downloaded",
								this.onPieceBytesDownloaded
							);
							peer.on(
								"bytes-uploaded",
								this.onPieceBytesUploaded
							);
							let peerCandidatesById = this.peerCandidates.get(
								peer.id
							);
							if (!peerCandidatesById) {
								peerCandidatesById = [];
								this.peerCandidates.set(
									peer.id,
									peerCandidatesById
								);
							}
							peerCandidatesById.push(peer);
						};
						this.onPieceBytesDownloaded = (peer, bytes) => {
							this.emit("bytes-downloaded", bytes, peer.id);
						};
						this.onPieceBytesUploaded = (peer, bytes) => {
							this.emit("bytes-uploaded", bytes, peer.id);
						};
						this.onPeerConnect = (peer) => {
							const connectedPeer = this.peers.get(peer.id);
							if (connectedPeer) {
								this.debug(
									"tracker peer already connected (in peer connect)",
									peer.id,
									peer
								);
								peer.destroy();
								return;
							}
							// First peer with the ID connected
							this.peers.set(peer.id, peer);
							// Destroy all other peer candidates
							const peerCandidatesById = this.peerCandidates.get(
								peer.id
							);
							if (peerCandidatesById) {
								for (const peerCandidate of peerCandidatesById) {
									if (peerCandidate != peer) {
										peerCandidate.destroy();
									}
								}
								this.peerCandidates.delete(peer.id);
							}
							this.emit("peer-connected", {
								id: peer.id,
								remoteAddress: peer.remoteAddress,
							});
						};
						this.onPeerClose = (peer) => {
							if (this.peers.get(peer.id) != peer) {
								// Try to delete the peer candidate
								const peerCandidatesById =
									this.peerCandidates.get(peer.id);
								if (!peerCandidatesById) {
									return;
								}
								const index = peerCandidatesById.indexOf(peer);
								if (index != -1) {
									peerCandidatesById.splice(index, 1);
								}
								if (peerCandidatesById.length == 0) {
									this.peerCandidates.delete(peer.id);
								}
								return;
							}
							for (const [key, value] of this
								.peerSegmentRequests) {
								if (value.peerId == peer.id) {
									this.peerSegmentRequests.delete(key);
								}
							}
							this.peers.delete(peer.id);
							this.emit("peer-data-updated");
							this.emit("peer-closed", peer.id);
						};
						this.onPeerDataUpdated = () => {
							this.emit("peer-data-updated");
						};
						this.onSegmentRequest = async (peer, segmentId) => {
							if (this.masterSwarmId === undefined) {
								return;
							}
							const segment =
								await this.sementsStorage.getSegment(
									segmentId,
									this.masterSwarmId
								);
							if (segment) {
								peer.sendSegmentData(segmentId, segment.data);
							} else {
								peer.sendSegmentAbsent(segmentId);
							}
						};
						this.onSegmentLoaded = async (
							peer,
							segmentId,
							data
						) => {
							const peerSegmentRequest =
								this.peerSegmentRequests.get(segmentId);
							if (!peerSegmentRequest) {
								return;
							}
							const segment = peerSegmentRequest.segment;
							if (this.settings.segmentValidator) {
								try {
									await this.settings.segmentValidator(
										Object.assign(
											Object.assign({}, segment),
											{ data: data }
										),
										"p2p",
										peer.id
									);
								} catch (error) {
									this.debug(
										"segment validator failed",
										error
									);
									this.peerSegmentRequests.delete(segmentId);
									this.emit(
										"segment-error",
										segment,
										error,
										peer.id
									);
									this.onPeerClose(peer);
									return;
								}
							}
							this.peerSegmentRequests.delete(segmentId);
							this.emit("segment-loaded", segment, data, peer.id);
						};
						this.onSegmentAbsent = (peer, segmentId) => {
							this.peerSegmentRequests.delete(segmentId);
							this.emit("peer-data-updated");
						};
						this.onSegmentError = (
							peer,
							segmentId,
							description
						) => {
							const peerSegmentRequest =
								this.peerSegmentRequests.get(segmentId);
							if (peerSegmentRequest) {
								this.peerSegmentRequests.delete(segmentId);
								this.emit(
									"segment-error",
									peerSegmentRequest.segment,
									description,
									peer.id
								);
							}
						};
						this.onSegmentTimeout = (peer, segmentId) => {
							const peerSegmentRequest =
								this.peerSegmentRequests.get(segmentId);
							if (peerSegmentRequest) {
								this.peerSegmentRequests.delete(segmentId);
								peer.destroy();
								if (
									this.peers.delete(peerSegmentRequest.peerId)
								) {
									this.emit("peer-data-updated");
								}
							}
						};
						this.peerId = settings.useP2P
							? generatePeerId()
							: new ArrayBuffer(0);
						if (this.debug.enabled) {
							this.debug(
								"peer ID",
								this.getPeerId(),
								new TextDecoder().decode(this.peerId)
							);
						}
					}
					getPeers() {
						return this.peers;
					}
					getPeerId() {
						return buffer_1.Buffer.from(this.peerId).toString(
							"hex"
						);
					}
					async setStreamSwarmId(streamSwarmId, masterSwarmId) {
						if (this.streamSwarmId === streamSwarmId) {
							return;
						}
						this.destroy(true);
						this.streamSwarmId = streamSwarmId;
						this.masterSwarmId = masterSwarmId;
						this.debug("stream swarm ID", this.streamSwarmId);
						this.pendingTrackerClient = {
							isDestroyed: false,
						};
						const pendingTrackerClient = this.pendingTrackerClient;
						// TODO: native browser 'crypto.subtle' implementation doesn't work in Chrome in insecure pages
						// TODO: Edge doesn't support SHA-1. Change to SHA-256 once Edge support is required.
						// const infoHash = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(PEER_PROTOCOL_VERSION + this.streamSwarmId));
						const infoHash = new sha1()
							.update(PEER_PROTOCOL_VERSION + this.streamSwarmId)
							.digest();
						// destroy may be called while waiting for the hash to be calculated
						if (!pendingTrackerClient.isDestroyed) {
							this.pendingTrackerClient = null;
							this.createClient(infoHash);
						} else if (this.trackerClient != null) {
							this.trackerClient.destroy();
							this.trackerClient = null;
						}
					}
					createClient(infoHash) {
						if (!this.settings.useP2P) {
							return;
						}
						const clientOptions = {
							infoHash: buffer_1.Buffer.from(infoHash, 0, 20),
							peerId: buffer_1.Buffer.from(this.peerId, 0, 20),
							announce: this.settings.trackerAnnounce,
							rtcConfig: this.settings.rtcConfig,
							port: 6881,
							getAnnounceOpts: () => {
								return {
									numwant:
										this.settings.peerRequestsPerAnnounce,
								};
							},
						};
						let oldTrackerClient = this.trackerClient;
						this.trackerClient = new Client(clientOptions);
						this.trackerClient.on("error", this.onTrackerError);
						this.trackerClient.on("warning", this.onTrackerWarning);
						this.trackerClient.on("update", this.onTrackerUpdate);
						this.trackerClient.on("peer", this.onTrackerPeer);
						this.trackerClient.start();
						if (oldTrackerClient != null) {
							oldTrackerClient.destroy();
							oldTrackerClient = null;
						}
					}
					download(segment) {
						if (this.isDownloading(segment)) {
							return false;
						}
						const candidates = [];
						for (const peer of this.peers.values()) {
							if (
								peer.getDownloadingSegmentId() == null &&
								peer.getSegmentsMap().get(segment.id) ===
									media_peer_1.MediaPeerSegmentStatus.Loaded
							) {
								candidates.push(peer);
							}
						}
						if (candidates.length === 0) {
							return false;
						}
						const peer =
							candidates[
								Math.floor(Math.random() * candidates.length)
							];
						peer.requestSegment(segment.id);
						this.peerSegmentRequests.set(
							segment.id,
							new PeerSegmentRequest(peer.id, segment)
						);
						return true;
					}
					abort(segment) {
						let downloadingSegment;
						const peerSegmentRequest = this.peerSegmentRequests.get(
							segment.id
						);
						if (peerSegmentRequest) {
							const peer = this.peers.get(
								peerSegmentRequest.peerId
							);
							if (peer) {
								downloadingSegment =
									peer.cancelSegmentRequest();
							}
							this.peerSegmentRequests.delete(segment.id);
						}
						return downloadingSegment;
					}
					isDownloading(segment) {
						return this.peerSegmentRequests.has(segment.id);
					}
					getActiveDownloadsCount() {
						return this.peerSegmentRequests.size;
					}
					destroy(swarmChange = false) {
						this.streamSwarmId = null;
						if (this.trackerClient) {
							this.trackerClient.stop();
							if (swarmChange) {
								// Don't destroy trackerClient to reuse its WebSocket connection to the tracker server
								this.trackerClient.removeAllListeners("error");
								this.trackerClient.removeAllListeners(
									"warning"
								);
								this.trackerClient.removeAllListeners("update");
								this.trackerClient.removeAllListeners("peer");
							} else {
								this.trackerClient.destroy();
								this.trackerClient = null;
							}
						}
						if (this.pendingTrackerClient) {
							this.pendingTrackerClient.isDestroyed = true;
							this.pendingTrackerClient = null;
						}
						this.peers.forEach((peer) => peer.destroy());
						this.peers.clear();
						this.peerSegmentRequests.clear();
						for (const peerCandidateById of this.peerCandidates.values()) {
							for (const peerCandidate of peerCandidateById) {
								peerCandidate.destroy();
							}
						}
						this.peerCandidates.clear();
					}
					sendSegmentsMapToAll(segmentsMap) {
						this.peers.forEach((peer) =>
							peer.sendSegmentsMap(segmentsMap)
						);
					}
					sendSegmentsMap(peerId, segmentsMap) {
						const peer = this.peers.get(peerId);
						if (peer) {
							peer.sendSegmentsMap(segmentsMap);
						}
					}
					getOvrallSegmentsMap() {
						const overallSegmentsMap = new Map();
						for (const peer of this.peers.values()) {
							for (const [
								segmentId,
								segmentStatus,
							] of peer.getSegmentsMap()) {
								if (
									segmentStatus ===
									media_peer_1.MediaPeerSegmentStatus.Loaded
								) {
									overallSegmentsMap.set(
										segmentId,
										media_peer_1.MediaPeerSegmentStatus
											.Loaded
									);
								} else if (!overallSegmentsMap.get(segmentId)) {
									overallSegmentsMap.set(
										segmentId,
										media_peer_1.MediaPeerSegmentStatus
											.LoadingByHttp
									);
								}
							}
						}
						return overallSegmentsMap;
					}
				}
				exports.P2PMediaManager = P2PMediaManager;
			},
			{
				"./index": "p2p-media-loader-core",
				"./media-peer": 6,
				"./stringly-typed-event-emitter": 9,
				"bittorrent-tracker/client": 11,
				buffer: 16,
				debug: "debug",
				"sha.js/sha1": 43,
			},
		],
		8: [
			function (require, module, exports) {
				"use strict";
				/**
				 * Copyright 2019 Novage LLC.
				 *
				 * Licensed under the Apache License, Version 2.0 (the "License");
				 * you may not use this file except in compliance with the License.
				 * You may obtain a copy of the License at
				 *
				 *     http://www.apache.org/licenses/LICENSE-2.0
				 *
				 * Unless required by applicable law or agreed to in writing, software
				 * distributed under the License is distributed on an "AS IS" BASIS,
				 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				 * See the License for the specific language governing permissions and
				 * limitations under the License.
				 */
				Object.defineProperty(exports, "__esModule", { value: true });
				class SegmentsMemoryStorage {
					constructor(settings) {
						this.settings = settings;
						this.cache = new Map();
					}
					async storeSegment(segment) {
						this.cache.set(segment.id, {
							segment,
							lastAccessed: performance.now(),
						});
					}
					async getSegmentsMap(masterSwarmId) {
						return this.cache;
					}
					async getSegment(id, masterSwarmId) {
						const cacheItem = this.cache.get(id);
						if (cacheItem === undefined) {
							return undefined;
						}
						cacheItem.lastAccessed = performance.now();
						return cacheItem.segment;
					}
					async hasSegment(id, masterSwarmId) {
						return this.cache.has(id);
					}
					async clean(masterSwarmId, lockedSementsfilter) {
						const segmentsToDelete = [];
						const remainingSegments = [];
						// Delete old segments
						const now = performance.now();
						for (const cachedSegment of this.cache.values()) {
							if (
								now - cachedSegment.lastAccessed >
								this.settings.cachedSegmentExpiration
							) {
								segmentsToDelete.push(cachedSegment.segment.id);
							} else {
								remainingSegments.push(cachedSegment);
							}
						}
						// Delete segments over cached count
						let countOverhead =
							remainingSegments.length -
							this.settings.cachedSegmentsCount;
						if (countOverhead > 0) {
							remainingSegments.sort(
								(a, b) => a.lastAccessed - b.lastAccessed
							);
							for (const cachedSegment of remainingSegments) {
								if (
									lockedSementsfilter === undefined ||
									!lockedSementsfilter(
										cachedSegment.segment.id
									)
								) {
									segmentsToDelete.push(
										cachedSegment.segment.id
									);
									countOverhead--;
									if (countOverhead == 0) {
										break;
									}
								}
							}
						}
						segmentsToDelete.forEach((id) => this.cache.delete(id));
						return segmentsToDelete.length > 0;
					}
					async destroy() {
						this.cache.clear();
					}
				}
				exports.SegmentsMemoryStorage = SegmentsMemoryStorage;
			},
			{},
		],
		9: [
			function (require, module, exports) {
				"use strict";
				/**
				 * Copyright 2018 Novage LLC.
				 *
				 * Licensed under the Apache License, Version 2.0 (the "License");
				 * you may not use this file except in compliance with the License.
				 * You may obtain a copy of the License at
				 *
				 *     http://www.apache.org/licenses/LICENSE-2.0
				 *
				 * Unless required by applicable law or agreed to in writing, software
				 * distributed under the License is distributed on an "AS IS" BASIS,
				 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				 * See the License for the specific language governing permissions and
				 * limitations under the License.
				 */
				Object.defineProperty(exports, "__esModule", { value: true });
				const events_1 = require("events");
				class STEEmitter extends events_1.EventEmitter {
					on(event, listener) {
						return super.on(event, listener);
					}
					emit(event, ...args) {
						return super.emit(event, ...args);
					}
				}
				exports.STEEmitter = STEEmitter;
			},
			{ events: "events" },
		],
		10: [
			function (require, module, exports) {
				"use strict";

				exports.byteLength = byteLength;
				exports.toByteArray = toByteArray;
				exports.fromByteArray = fromByteArray;

				var lookup = [];
				var revLookup = [];
				var Arr =
					typeof Uint8Array !== "undefined" ? Uint8Array : Array;

				var code =
					"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
				for (var i = 0, len = code.length; i < len; ++i) {
					lookup[i] = code[i];
					revLookup[code.charCodeAt(i)] = i;
				}

				// Support decoding URL-safe base64 strings, as Node.js does.
				// See: https://en.wikipedia.org/wiki/Base64#URL_applications
				revLookup["-".charCodeAt(0)] = 62;
				revLookup["_".charCodeAt(0)] = 63;

				function getLens(b64) {
					var len = b64.length;

					if (len % 4 > 0) {
						throw new Error(
							"Invalid string. Length must be a multiple of 4"
						);
					}

					// Trim off extra bytes after placeholder bytes are found
					// See: https://github.com/beatgammit/base64-js/issues/42
					var validLen = b64.indexOf("=");
					if (validLen === -1) validLen = len;

					var placeHoldersLen =
						validLen === len ? 0 : 4 - (validLen % 4);

					return [validLen, placeHoldersLen];
				}

				// base64 is 4/3 + up to two characters of the original data
				function byteLength(b64) {
					var lens = getLens(b64);
					var validLen = lens[0];
					var placeHoldersLen = lens[1];
					return (
						((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen
					);
				}

				function _byteLength(b64, validLen, placeHoldersLen) {
					return (
						((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen
					);
				}

				function toByteArray(b64) {
					var tmp;
					var lens = getLens(b64);
					var validLen = lens[0];
					var placeHoldersLen = lens[1];

					var arr = new Arr(
						_byteLength(b64, validLen, placeHoldersLen)
					);

					var curByte = 0;

					// if there are placeholders, only get up to the last complete 4 chars
					var len = placeHoldersLen > 0 ? validLen - 4 : validLen;

					var i;
					for (i = 0; i < len; i += 4) {
						tmp =
							(revLookup[b64.charCodeAt(i)] << 18) |
							(revLookup[b64.charCodeAt(i + 1)] << 12) |
							(revLookup[b64.charCodeAt(i + 2)] << 6) |
							revLookup[b64.charCodeAt(i + 3)];
						arr[curByte++] = (tmp >> 16) & 0xff;
						arr[curByte++] = (tmp >> 8) & 0xff;
						arr[curByte++] = tmp & 0xff;
					}

					if (placeHoldersLen === 2) {
						tmp =
							(revLookup[b64.charCodeAt(i)] << 2) |
							(revLookup[b64.charCodeAt(i + 1)] >> 4);
						arr[curByte++] = tmp & 0xff;
					}

					if (placeHoldersLen === 1) {
						tmp =
							(revLookup[b64.charCodeAt(i)] << 10) |
							(revLookup[b64.charCodeAt(i + 1)] << 4) |
							(revLookup[b64.charCodeAt(i + 2)] >> 2);
						arr[curByte++] = (tmp >> 8) & 0xff;
						arr[curByte++] = tmp & 0xff;
					}

					return arr;
				}

				function tripletToBase64(num) {
					return (
						lookup[(num >> 18) & 0x3f] +
						lookup[(num >> 12) & 0x3f] +
						lookup[(num >> 6) & 0x3f] +
						lookup[num & 0x3f]
					);
				}

				function encodeChunk(uint8, start, end) {
					var tmp;
					var output = [];
					for (var i = start; i < end; i += 3) {
						tmp =
							((uint8[i] << 16) & 0xff0000) +
							((uint8[i + 1] << 8) & 0xff00) +
							(uint8[i + 2] & 0xff);
						output.push(tripletToBase64(tmp));
					}
					return output.join("");
				}

				function fromByteArray(uint8) {
					var tmp;
					var len = uint8.length;
					var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
					var parts = [];
					var maxChunkLength = 16383; // must be multiple of 3

					// go through the array every three bytes, we'll deal with trailing stuff later
					for (
						var i = 0, len2 = len - extraBytes;
						i < len2;
						i += maxChunkLength
					) {
						parts.push(
							encodeChunk(
								uint8,
								i,
								i + maxChunkLength > len2
									? len2
									: i + maxChunkLength
							)
						);
					}

					// pad the end with zeros, but make sure to not forget the extra bytes
					if (extraBytes === 1) {
						tmp = uint8[len - 1];
						parts.push(
							lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + "=="
						);
					} else if (extraBytes === 2) {
						tmp = (uint8[len - 2] << 8) + uint8[len - 1];
						parts.push(
							lookup[tmp >> 10] +
								lookup[(tmp >> 4) & 0x3f] +
								lookup[(tmp << 2) & 0x3f] +
								"="
						);
					}

					return parts.join("");
				}
			},
			{},
		],
		11: [
			function (require, module, exports) {
				(function (process, Buffer) {
					const debug = require("debug")("bittorrent-tracker:client");
					const EventEmitter = require("events");
					const once = require("once");
					const parallel = require("run-parallel");
					const Peer = require("simple-peer");
					const uniq = require("uniq");

					const common = require("./lib/common");
					const HTTPTracker = require("./lib/client/http-tracker"); // empty object in browser
					const UDPTracker = require("./lib/client/udp-tracker"); // empty object in browser
					const WebSocketTracker = require("./lib/client/websocket-tracker");

					/**
					 * BitTorrent tracker client.
					 *
					 * Find torrent peers, to help a torrent client participate in a torrent swarm.
					 *
					 * @param {Object} opts                          options object
					 * @param {string|Buffer} opts.infoHash          torrent info hash
					 * @param {string|Buffer} opts.peerId            peer id
					 * @param {string|Array.<string>} opts.announce  announce
					 * @param {number} opts.port                     torrent client listening port
					 * @param {function} opts.getAnnounceOpts        callback to provide data to tracker
					 * @param {number} opts.rtcConfig                RTCPeerConnection configuration object
					 * @param {number} opts.userAgent                User-Agent header for http requests
					 * @param {number} opts.wrtc                     custom webrtc impl (useful in node.js)
					 */
					class Client extends EventEmitter {
						constructor(opts = {}) {
							super();

							if (!opts.peerId)
								throw new Error("Option `peerId` is required");
							if (!opts.infoHash)
								throw new Error(
									"Option `infoHash` is required"
								);
							if (!opts.announce)
								throw new Error(
									"Option `announce` is required"
								);
							if (!process.browser && !opts.port)
								throw new Error("Option `port` is required");

							this.peerId =
								typeof opts.peerId === "string"
									? opts.peerId
									: opts.peerId.toString("hex");
							this._peerIdBuffer = Buffer.from(
								this.peerId,
								"hex"
							);
							this._peerIdBinary =
								this._peerIdBuffer.toString("binary");

							this.infoHash =
								typeof opts.infoHash === "string"
									? opts.infoHash.toLowerCase()
									: opts.infoHash.toString("hex");
							this._infoHashBuffer = Buffer.from(
								this.infoHash,
								"hex"
							);
							this._infoHashBinary =
								this._infoHashBuffer.toString("binary");

							debug("new client %s", this.infoHash);

							this.destroyed = false;

							this._port = opts.port;
							this._getAnnounceOpts = opts.getAnnounceOpts;
							this._rtcConfig = opts.rtcConfig;
							this._userAgent = opts.userAgent;

							// Support lazy 'wrtc' module initialization
							// See: https://github.com/webtorrent/webtorrent-hybrid/issues/46
							this._wrtc =
								typeof opts.wrtc === "function"
									? opts.wrtc()
									: opts.wrtc;

							let announce =
								typeof opts.announce === "string"
									? [opts.announce]
									: opts.announce == null
									? []
									: opts.announce;

							// Remove trailing slash from trackers to catch duplicates
							announce = announce.map((announceUrl) => {
								announceUrl = announceUrl.toString();
								if (
									announceUrl[announceUrl.length - 1] === "/"
								) {
									announceUrl = announceUrl.substring(
										0,
										announceUrl.length - 1
									);
								}
								return announceUrl;
							});
							announce = uniq(announce);

							const webrtcSupport =
								this._wrtc !== false &&
								(!!this._wrtc || Peer.WEBRTC_SUPPORT);

							const nextTickWarn = (err) => {
								process.nextTick(() => {
									this.emit("warning", err);
								});
							};

							this._trackers = announce
								.map((announceUrl) => {
									let parsedUrl;
									try {
										parsedUrl = new URL(announceUrl);
									} catch (err) {
										nextTickWarn(
											new Error(
												`Invalid tracker URL: ${announceUrl}`
											)
										);
										return null;
									}

									const port = parsedUrl.port;
									if (port < 0 || port > 65535) {
										nextTickWarn(
											new Error(
												`Invalid tracker port: ${announceUrl}`
											)
										);
										return null;
									}

									const protocol = parsedUrl.protocol;
									if (
										(protocol === "http:" ||
											protocol === "https:") &&
										typeof HTTPTracker === "function"
									) {
										return new HTTPTracker(
											this,
											announceUrl
										);
									} else if (
										protocol === "udp:" &&
										typeof UDPTracker === "function"
									) {
										return new UDPTracker(
											this,
											announceUrl
										);
									} else if (
										(protocol === "ws:" ||
											protocol === "wss:") &&
										webrtcSupport
									) {
										// Skip ws:// trackers on https:// sites because they throw SecurityError
										if (
											protocol === "ws:" &&
											typeof window !== "undefined" &&
											window.location.protocol ===
												"https:"
										) {
											nextTickWarn(
												new Error(
													`Unsupported tracker protocol: ${announceUrl}`
												)
											);
											return null;
										}
										return new WebSocketTracker(
											this,
											announceUrl
										);
									} else {
										nextTickWarn(
											new Error(
												`Unsupported tracker protocol: ${announceUrl}`
											)
										);
										return null;
									}
								})
								.filter(Boolean);
						}

						/**
						 * Send a `start` announce to the trackers.
						 * @param {Object} opts
						 * @param {number=} opts.uploaded
						 * @param {number=} opts.downloaded
						 * @param {number=} opts.left (if not set, calculated automatically)
						 */
						start(opts) {
							opts = this._defaultAnnounceOpts(opts);
							opts.event = "started";
							debug("send `start` %o", opts);
							this._announce(opts);

							// start announcing on intervals
							this._trackers.forEach((tracker) => {
								tracker.setInterval();
							});
						}

						/**
						 * Send a `stop` announce to the trackers.
						 * @param {Object} opts
						 * @param {number=} opts.uploaded
						 * @param {number=} opts.downloaded
						 * @param {number=} opts.numwant
						 * @param {number=} opts.left (if not set, calculated automatically)
						 */
						stop(opts) {
							opts = this._defaultAnnounceOpts(opts);
							opts.event = "stopped";
							debug("send `stop` %o", opts);
							this._announce(opts);
						}

						/**
						 * Send a `complete` announce to the trackers.
						 * @param {Object} opts
						 * @param {number=} opts.uploaded
						 * @param {number=} opts.downloaded
						 * @param {number=} opts.numwant
						 * @param {number=} opts.left (if not set, calculated automatically)
						 */
						complete(opts) {
							if (!opts) opts = {};
							opts = this._defaultAnnounceOpts(opts);
							opts.event = "completed";
							debug("send `complete` %o", opts);
							this._announce(opts);
						}

						/**
						 * Send a `update` announce to the trackers.
						 * @param {Object} opts
						 * @param {number=} opts.uploaded
						 * @param {number=} opts.downloaded
						 * @param {number=} opts.numwant
						 * @param {number=} opts.left (if not set, calculated automatically)
						 */
						update(opts) {
							opts = this._defaultAnnounceOpts(opts);
							if (opts.event) delete opts.event;
							debug("send `update` %o", opts);
							this._announce(opts);
						}

						_announce(opts) {
							this._trackers.forEach((tracker) => {
								// tracker should not modify `opts` object, it's passed to all trackers
								tracker.announce(opts);
							});
						}

						/**
						 * Send a scrape request to the trackers.
						 * @param {Object} opts
						 */
						scrape(opts) {
							debug("send `scrape`");
							if (!opts) opts = {};
							this._trackers.forEach((tracker) => {
								// tracker should not modify `opts` object, it's passed to all trackers
								tracker.scrape(opts);
							});
						}

						setInterval(intervalMs) {
							debug("setInterval %d", intervalMs);
							this._trackers.forEach((tracker) => {
								tracker.setInterval(intervalMs);
							});
						}

						destroy(cb) {
							if (this.destroyed) return;
							this.destroyed = true;
							debug("destroy");

							const tasks = this._trackers.map(
								(tracker) => (cb) => {
									tracker.destroy(cb);
								}
							);

							parallel(tasks, cb);

							this._trackers = [];
							this._getAnnounceOpts = null;
						}

						_defaultAnnounceOpts(opts = {}) {
							if (opts.numwant == null)
								opts.numwant = common.DEFAULT_ANNOUNCE_PEERS;

							if (opts.uploaded == null) opts.uploaded = 0;
							if (opts.downloaded == null) opts.downloaded = 0;

							if (this._getAnnounceOpts)
								opts = Object.assign(
									{},
									opts,
									this._getAnnounceOpts()
								);

							return opts;
						}
					}

					/**
					 * Simple convenience function to scrape a tracker for an info hash without needing to
					 * create a Client, pass it a parsed torrent, etc. Support scraping a tracker for multiple
					 * torrents at the same time.
					 * @params {Object} opts
					 * @param  {string|Array.<string>} opts.infoHash
					 * @param  {string} opts.announce
					 * @param  {function} cb
					 */
					Client.scrape = (opts, cb) => {
						cb = once(cb);

						if (!opts.infoHash)
							throw new Error("Option `infoHash` is required");
						if (!opts.announce)
							throw new Error("Option `announce` is required");

						const clientOpts = Object.assign({}, opts, {
							infoHash: Array.isArray(opts.infoHash)
								? opts.infoHash[0]
								: opts.infoHash,
							peerId: Buffer.from("01234567890123456789"), // dummy value
							port: 6881, // dummy value
						});

						const client = new Client(clientOpts);
						client.once("error", cb);
						client.once("warning", cb);

						let len = Array.isArray(opts.infoHash)
							? opts.infoHash.length
							: 1;
						const results = {};
						client.on("scrape", (data) => {
							len -= 1;
							results[data.infoHash] = data;
							if (len === 0) {
								client.destroy();
								const keys = Object.keys(results);
								if (keys.length === 1) {
									cb(null, results[keys[0]]);
								} else {
									cb(null, results);
								}
							}
						});

						opts.infoHash = Array.isArray(opts.infoHash)
							? opts.infoHash.map((infoHash) => {
									return Buffer.from(infoHash, "hex");
							  })
							: Buffer.from(opts.infoHash, "hex");
						client.scrape({ infoHash: opts.infoHash });
						return client;
					};

					module.exports = Client;
				}).call(this, require("_process"), require("buffer").Buffer);
			},
			{
				"./lib/client/http-tracker": 15,
				"./lib/client/udp-tracker": 15,
				"./lib/client/websocket-tracker": 13,
				"./lib/common": 14,
				_process: 23,
				buffer: 16,
				debug: "debug",
				events: "events",
				once: 22,
				"run-parallel": 40,
				"simple-peer": 44,
				uniq: 47,
			},
		],
		12: [
			function (require, module, exports) {
				const EventEmitter = require("events");

				class Tracker extends EventEmitter {
					constructor(client, announceUrl) {
						super();

						this.client = client;
						this.announceUrl = announceUrl;

						this.interval = null;
						this.destroyed = false;
					}

					setInterval(intervalMs) {
						if (intervalMs == null)
							intervalMs = this.DEFAULT_ANNOUNCE_INTERVAL;

						clearInterval(this.interval);

						if (intervalMs) {
							this.interval = setInterval(() => {
								this.announce(
									this.client._defaultAnnounceOpts()
								);
							}, intervalMs);
							if (this.interval.unref) this.interval.unref();
						}
					}
				}

				module.exports = Tracker;
			},
			{ events: "events" },
		],
		13: [
			function (require, module, exports) {
				const debug = require("debug")(
					"bittorrent-tracker:websocket-tracker"
				);
				const Peer = require("simple-peer");
				const randombytes = require("randombytes");
				const Socket = require("simple-websocket");

				const common = require("../common");
				const Tracker = require("./tracker");

				// Use a socket pool, so tracker clients share WebSocket objects for the same server.
				// In practice, WebSockets are pretty slow to establish, so this gives a nice performance
				// boost, and saves browser resources.
				const socketPool = {};

				const RECONNECT_MINIMUM = 10 * 1000;
				const RECONNECT_MAXIMUM = 30 * 60 * 1000;
				const RECONNECT_VARIANCE = 2 * 60 * 1000;
				const OFFER_TIMEOUT = 50 * 1000;

				class WebSocketTracker extends Tracker {
					constructor(client, announceUrl, opts) {
						super(client, announceUrl);
						debug("new websocket tracker %s", announceUrl);

						this.peers = {}; // peers (offer id -> peer)
						this.socket = null;

						this.reconnecting = false;
						this.retries = 0;
						this.reconnectTimer = null;

						// Simple boolean flag to track whether the socket has received data from
						// the websocket server since the last time socket.send() was called.
						this.expectingResponse = false;

						this._openSocket();
					}

					announce(opts) {
						if (this.destroyed || this.reconnecting) return;
						if (!this.socket.connected) {
							this.socket.once("connect", () => {
								this.announce(opts);
							});
							return;
						}

						const params = Object.assign({}, opts, {
							action: "announce",
							info_hash: this.client._infoHashBinary,
							peer_id: this.client._peerIdBinary,
						});
						if (this._trackerId) params.trackerid = this._trackerId;

						if (
							opts.event === "stopped" ||
							opts.event === "completed"
						) {
							// Don't include offers with 'stopped' or 'completed' event
							this._send(params);
						} else {
							// Limit the number of offers that are generated, since it can be slow
							const numwant = Math.min(opts.numwant, 10);

							this._generateOffers(numwant, (offers) => {
								params.numwant = numwant;
								params.offers = offers;
								this._send(params);
							});
						}
					}

					scrape(opts) {
						if (this.destroyed || this.reconnecting) return;
						if (!this.socket.connected) {
							this.socket.once("connect", () => {
								this.scrape(opts);
							});
							return;
						}

						const infoHashes =
							Array.isArray(opts.infoHash) &&
							opts.infoHash.length > 0
								? opts.infoHash.map((infoHash) => {
										return infoHash.toString("binary");
								  })
								: (opts.infoHash &&
										opts.infoHash.toString("binary")) ||
								  this.client._infoHashBinary;
						const params = {
							action: "scrape",
							info_hash: infoHashes,
						};

						this._send(params);
					}

					destroy(cb = noop) {
						if (this.destroyed) return cb(null);

						this.destroyed = true;

						clearInterval(this.interval);
						clearTimeout(this.reconnectTimer);

						// Destroy peers
						for (const peerId in this.peers) {
							const peer = this.peers[peerId];
							clearTimeout(peer.trackerTimeout);
							peer.destroy();
						}
						this.peers = null;

						if (this.socket) {
							this.socket.removeListener(
								"connect",
								this._onSocketConnectBound
							);
							this.socket.removeListener(
								"data",
								this._onSocketDataBound
							);
							this.socket.removeListener(
								"close",
								this._onSocketCloseBound
							);
							this.socket.removeListener(
								"error",
								this._onSocketErrorBound
							);
							this.socket = null;
						}

						this._onSocketConnectBound = null;
						this._onSocketErrorBound = null;
						this._onSocketDataBound = null;
						this._onSocketCloseBound = null;

						if (socketPool[this.announceUrl]) {
							socketPool[this.announceUrl].consumers -= 1;
						}

						// Other instances are using the socket, so there's nothing left to do here
						if (socketPool[this.announceUrl].consumers > 0)
							return cb();

						let socket = socketPool[this.announceUrl];
						delete socketPool[this.announceUrl];
						socket.on("error", noop); // ignore all future errors
						socket.once("close", cb);

						// If there is no data response expected, destroy immediately.
						if (!this.expectingResponse) return destroyCleanup();

						// Otherwise, wait a short time for potential responses to come in from the
						// server, then force close the socket.
						var timeout = setTimeout(
							destroyCleanup,
							common.DESTROY_TIMEOUT
						);

						// But, if a response comes from the server before the timeout fires, do cleanup
						// right away.
						socket.once("data", destroyCleanup);

						function destroyCleanup() {
							if (timeout) {
								clearTimeout(timeout);
								timeout = null;
							}
							socket.removeListener("data", destroyCleanup);
							socket.destroy();
							socket = null;
						}
					}

					_openSocket() {
						this.destroyed = false;

						if (!this.peers) this.peers = {};

						this._onSocketConnectBound = () => {
							this._onSocketConnect();
						};
						this._onSocketErrorBound = (err) => {
							this._onSocketError(err);
						};
						this._onSocketDataBound = (data) => {
							this._onSocketData(data);
						};
						this._onSocketCloseBound = () => {
							this._onSocketClose();
						};

						this.socket = socketPool[this.announceUrl];
						if (this.socket) {
							socketPool[this.announceUrl].consumers += 1;
							if (this.socket.connected) {
								this._onSocketConnectBound();
							}
						} else {
							this.socket = socketPool[this.announceUrl] =
								new Socket(this.announceUrl);
							this.socket.consumers = 1;
							this.socket.once(
								"connect",
								this._onSocketConnectBound
							);
						}

						this.socket.on("data", this._onSocketDataBound);
						this.socket.once("close", this._onSocketCloseBound);
						this.socket.once("error", this._onSocketErrorBound);
					}

					_onSocketConnect() {
						if (this.destroyed) return;

						if (this.reconnecting) {
							this.reconnecting = false;
							this.retries = 0;
							this.announce(this.client._defaultAnnounceOpts());
						}
					}

					_onSocketData(data) {
						if (this.destroyed) return;

						this.expectingResponse = false;

						try {
							data = JSON.parse(data);
						} catch (err) {
							this.client.emit(
								"warning",
								new Error("Invalid tracker response")
							);
							return;
						}

						if (data.action === "announce") {
							this._onAnnounceResponse(data);
						} else if (data.action === "scrape") {
							this._onScrapeResponse(data);
						} else {
							this._onSocketError(
								new Error(
									`invalid action in WS response: ${data.action}`
								)
							);
						}
					}

					_onAnnounceResponse(data) {
						if (data.info_hash !== this.client._infoHashBinary) {
							debug(
								"ignoring websocket data from %s for %s (looking for %s: reused socket)",
								this.announceUrl,
								common.binaryToHex(data.info_hash),
								this.client.infoHash
							);
							return;
						}

						if (
							data.peer_id &&
							data.peer_id === this.client._peerIdBinary
						) {
							// ignore offers/answers from this client
							return;
						}

						debug(
							"received %s from %s for %s",
							JSON.stringify(data),
							this.announceUrl,
							this.client.infoHash
						);

						const failure = data["failure reason"];
						if (failure)
							return this.client.emit(
								"warning",
								new Error(failure)
							);

						const warning = data["warning message"];
						if (warning)
							this.client.emit("warning", new Error(warning));

						const interval = data.interval || data["min interval"];
						if (interval) this.setInterval(interval * 1000);

						const trackerId = data["tracker id"];
						if (trackerId) {
							// If absent, do not discard previous trackerId value
							this._trackerId = trackerId;
						}

						if (data.complete != null) {
							const response = Object.assign({}, data, {
								announce: this.announceUrl,
								infoHash: common.binaryToHex(data.info_hash),
							});
							this.client.emit("update", response);
						}

						let peer;
						if (data.offer && data.peer_id) {
							debug("creating peer (from remote offer)");
							peer = this._createPeer();
							peer.id = common.binaryToHex(data.peer_id);
							peer.once("signal", (answer) => {
								const params = {
									action: "announce",
									info_hash: this.client._infoHashBinary,
									peer_id: this.client._peerIdBinary,
									to_peer_id: data.peer_id,
									answer,
									offer_id: data.offer_id,
								};
								if (this._trackerId)
									params.trackerid = this._trackerId;
								this._send(params);
							});
							peer.signal(data.offer);
							this.client.emit("peer", peer);
						}

						if (data.answer && data.peer_id) {
							const offerId = common.binaryToHex(data.offer_id);
							peer = this.peers[offerId];
							if (peer) {
								peer.id = common.binaryToHex(data.peer_id);
								peer.signal(data.answer);
								this.client.emit("peer", peer);

								clearTimeout(peer.trackerTimeout);
								peer.trackerTimeout = null;
								delete this.peers[offerId];
							} else {
								debug(
									`got unexpected answer: ${JSON.stringify(
										data.answer
									)}`
								);
							}
						}
					}

					_onScrapeResponse(data) {
						data = data.files || {};

						const keys = Object.keys(data);
						if (keys.length === 0) {
							this.client.emit(
								"warning",
								new Error("invalid scrape response")
							);
							return;
						}

						keys.forEach((infoHash) => {
							// TODO: optionally handle data.flags.min_request_interval
							// (separate from announce interval)
							const response = Object.assign(data[infoHash], {
								announce: this.announceUrl,
								infoHash: common.binaryToHex(infoHash),
							});
							this.client.emit("scrape", response);
						});
					}

					_onSocketClose() {
						if (this.destroyed) return;
						this.destroy();
						this._startReconnectTimer();
					}

					_onSocketError(err) {
						if (this.destroyed) return;
						this.destroy();
						// errors will often happen if a tracker is offline, so don't treat it as fatal
						this.client.emit("warning", err);
						this._startReconnectTimer();
					}

					_startReconnectTimer() {
						const ms =
							Math.floor(Math.random() * RECONNECT_VARIANCE) +
							Math.min(
								Math.pow(2, this.retries) * RECONNECT_MINIMUM,
								RECONNECT_MAXIMUM
							);

						this.reconnecting = true;
						clearTimeout(this.reconnectTimer);
						this.reconnectTimer = setTimeout(() => {
							this.retries++;
							this._openSocket();
						}, ms);
						if (this.reconnectTimer.unref)
							this.reconnectTimer.unref();

						debug("reconnecting socket in %s ms", ms);
					}

					_send(params) {
						if (this.destroyed) return;
						this.expectingResponse = true;
						const message = JSON.stringify(params);
						debug("send %s", message);
						this.socket.send(message);
					}

					_generateOffers(numwant, cb) {
						const self = this;
						const offers = [];
						debug("generating %s offers", numwant);

						for (let i = 0; i < numwant; ++i) {
							generateOffer();
						}
						checkDone();

						function generateOffer() {
							const offerId = randombytes(20).toString("hex");
							debug("creating peer (from _generateOffers)");
							const peer = (self.peers[offerId] =
								self._createPeer({ initiator: true }));
							peer.once("signal", (offer) => {
								offers.push({
									offer,
									offer_id: common.hexToBinary(offerId),
								});
								checkDone();
							});
							peer.trackerTimeout = setTimeout(() => {
								debug("tracker timeout: destroying peer");
								peer.trackerTimeout = null;
								delete self.peers[offerId];
								peer.destroy();
							}, OFFER_TIMEOUT);
							if (peer.trackerTimeout.unref)
								peer.trackerTimeout.unref();
						}

						function checkDone() {
							if (offers.length === numwant) {
								debug("generated %s offers", numwant);
								cb(offers);
							}
						}
					}

					_createPeer(opts) {
						const self = this;

						opts = Object.assign(
							{
								trickle: false,
								config: self.client._rtcConfig,
								wrtc: self.client._wrtc,
							},
							opts
						);

						const peer = new Peer(opts);

						peer.once("error", onError);
						peer.once("connect", onConnect);

						return peer;

						// Handle peer 'error' events that are fired *before* the peer is emitted in
						// a 'peer' event.
						function onError(err) {
							self.client.emit(
								"warning",
								new Error(`Connection error: ${err.message}`)
							);
							peer.destroy();
						}

						// Once the peer is emitted in a 'peer' event, then it's the consumer's
						// responsibility to listen for errors, so the listeners are removed here.
						function onConnect() {
							peer.removeListener("error", onError);
							peer.removeListener("connect", onConnect);
						}
					}
				}

				WebSocketTracker.prototype.DEFAULT_ANNOUNCE_INTERVAL =
					30 * 1000; // 30 seconds
				// Normally this shouldn't be accessed but is occasionally useful
				WebSocketTracker._socketPool = socketPool;

				function noop() {}

				module.exports = WebSocketTracker;
			},
			{
				"../common": 14,
				"./tracker": 12,
				debug: "debug",
				randombytes: 24,
				"simple-peer": 44,
				"simple-websocket": 45,
			},
		],
		14: [
			function (require, module, exports) {
				(function (Buffer) {
					/**
					 * Functions/constants needed by both the client and server.
					 */

					exports.DEFAULT_ANNOUNCE_PEERS = 50;
					exports.MAX_ANNOUNCE_PEERS = 82;

					exports.binaryToHex = function (str) {
						if (typeof str !== "string") {
							str = String(str);
						}
						return Buffer.from(str, "binary").toString("hex");
					};

					exports.hexToBinary = function (str) {
						if (typeof str !== "string") {
							str = String(str);
						}
						return Buffer.from(str, "hex").toString("binary");
					};

					var config = require("./common-node");
					Object.assign(exports, config);
				}).call(this, require("buffer").Buffer);
			},
			{ "./common-node": 15, buffer: 16 },
		],
		15: [function (require, module, exports) {}, {}],
		16: [
			function (require, module, exports) {
				(function (Buffer) {
					/*!
					 * The buffer module from node.js, for the browser.
					 *
					 * @author   Feross Aboukhadijeh <https://feross.org>
					 * @license  MIT
					 */
					/* eslint-disable no-proto */

					"use strict";

					var base64 = require("base64-js");
					var ieee754 = require("ieee754");
					var customInspectSymbol =
						typeof Symbol === "function" &&
						typeof Symbol.for === "function"
							? Symbol.for("nodejs.util.inspect.custom")
							: null;

					exports.Buffer = Buffer;
					exports.SlowBuffer = SlowBuffer;
					exports.INSPECT_MAX_BYTES = 50;

					var K_MAX_LENGTH = 0x7fffffff;
					exports.kMaxLength = K_MAX_LENGTH;

					/**
					 * If `Buffer.TYPED_ARRAY_SUPPORT`:
					 *   === true    Use Uint8Array implementation (fastest)
					 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
					 *               implementation (most compatible, even IE6)
					 *
					 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
					 * Opera 11.6+, iOS 4.2+.
					 *
					 * We report that the browser does not support typed arrays if the are not subclassable
					 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
					 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
					 * for __proto__ and has a buggy typed array implementation.
					 */
					Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

					if (
						!Buffer.TYPED_ARRAY_SUPPORT &&
						typeof console !== "undefined" &&
						typeof console.error === "function"
					) {
						console.error(
							"This browser lacks typed array (Uint8Array) support which is required by " +
								"`buffer` v5.x. Use `buffer` v4.x if you require old browser support."
						);
					}

					function typedArraySupport() {
						// Can typed array instances can be augmented?
						try {
							var arr = new Uint8Array(1);
							var proto = {
								foo: function () {
									return 42;
								},
							};
							Object.setPrototypeOf(proto, Uint8Array.prototype);
							Object.setPrototypeOf(arr, proto);
							return arr.foo() === 42;
						} catch (e) {
							return false;
						}
					}

					Object.defineProperty(Buffer.prototype, "parent", {
						enumerable: true,
						get: function () {
							if (!Buffer.isBuffer(this)) return undefined;
							return this.buffer;
						},
					});

					Object.defineProperty(Buffer.prototype, "offset", {
						enumerable: true,
						get: function () {
							if (!Buffer.isBuffer(this)) return undefined;
							return this.byteOffset;
						},
					});

					function createBuffer(length) {
						if (length > K_MAX_LENGTH) {
							throw new RangeError(
								'The value "' +
									length +
									'" is invalid for option "size"'
							);
						}
						// Return an augmented `Uint8Array` instance
						var buf = new Uint8Array(length);
						Object.setPrototypeOf(buf, Buffer.prototype);
						return buf;
					}

					/**
					 * The Buffer constructor returns instances of `Uint8Array` that have their
					 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
					 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
					 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
					 * returns a single octet.
					 *
					 * The `Uint8Array` prototype remains unmodified.
					 */

					function Buffer(arg, encodingOrOffset, length) {
						// Common case.
						if (typeof arg === "number") {
							if (typeof encodingOrOffset === "string") {
								throw new TypeError(
									'The "string" argument must be of type string. Received type number'
								);
							}
							return allocUnsafe(arg);
						}
						return from(arg, encodingOrOffset, length);
					}

					// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
					if (
						typeof Symbol !== "undefined" &&
						Symbol.species != null &&
						Buffer[Symbol.species] === Buffer
					) {
						Object.defineProperty(Buffer, Symbol.species, {
							value: null,
							configurable: true,
							enumerable: false,
							writable: false,
						});
					}

					Buffer.poolSize = 8192; // not used by this implementation

					function from(value, encodingOrOffset, length) {
						if (typeof value === "string") {
							return fromString(value, encodingOrOffset);
						}

						if (ArrayBuffer.isView(value)) {
							return fromArrayLike(value);
						}

						if (value == null) {
							throw new TypeError(
								"The first argument must be one of type string, Buffer, ArrayBuffer, Array, " +
									"or Array-like Object. Received type " +
									typeof value
							);
						}

						if (
							isInstance(value, ArrayBuffer) ||
							(value && isInstance(value.buffer, ArrayBuffer))
						) {
							return fromArrayBuffer(
								value,
								encodingOrOffset,
								length
							);
						}

						if (typeof value === "number") {
							throw new TypeError(
								'The "value" argument must not be of type number. Received type number'
							);
						}

						var valueOf = value.valueOf && value.valueOf();
						if (valueOf != null && valueOf !== value) {
							return Buffer.from(
								valueOf,
								encodingOrOffset,
								length
							);
						}

						var b = fromObject(value);
						if (b) return b;

						if (
							typeof Symbol !== "undefined" &&
							Symbol.toPrimitive != null &&
							typeof value[Symbol.toPrimitive] === "function"
						) {
							return Buffer.from(
								value[Symbol.toPrimitive]("string"),
								encodingOrOffset,
								length
							);
						}

						throw new TypeError(
							"The first argument must be one of type string, Buffer, ArrayBuffer, Array, " +
								"or Array-like Object. Received type " +
								typeof value
						);
					}

					/**
					 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
					 * if value is a number.
					 * Buffer.from(str[, encoding])
					 * Buffer.from(array)
					 * Buffer.from(buffer)
					 * Buffer.from(arrayBuffer[, byteOffset[, length]])
					 **/
					Buffer.from = function (value, encodingOrOffset, length) {
						return from(value, encodingOrOffset, length);
					};

					// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
					// https://github.com/feross/buffer/pull/148
					Object.setPrototypeOf(
						Buffer.prototype,
						Uint8Array.prototype
					);
					Object.setPrototypeOf(Buffer, Uint8Array);

					function assertSize(size) {
						if (typeof size !== "number") {
							throw new TypeError(
								'"size" argument must be of type number'
							);
						} else if (size < 0) {
							throw new RangeError(
								'The value "' +
									size +
									'" is invalid for option "size"'
							);
						}
					}

					function alloc(size, fill, encoding) {
						assertSize(size);
						if (size <= 0) {
							return createBuffer(size);
						}
						if (fill !== undefined) {
							// Only pay attention to encoding if it's a string. This
							// prevents accidentally sending in a number that would
							// be interpretted as a start offset.
							return typeof encoding === "string"
								? createBuffer(size).fill(fill, encoding)
								: createBuffer(size).fill(fill);
						}
						return createBuffer(size);
					}

					/**
					 * Creates a new filled Buffer instance.
					 * alloc(size[, fill[, encoding]])
					 **/
					Buffer.alloc = function (size, fill, encoding) {
						return alloc(size, fill, encoding);
					};

					function allocUnsafe(size) {
						assertSize(size);
						return createBuffer(size < 0 ? 0 : checked(size) | 0);
					}

					/**
					 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
					 * */
					Buffer.allocUnsafe = function (size) {
						return allocUnsafe(size);
					};
					/**
					 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
					 */
					Buffer.allocUnsafeSlow = function (size) {
						return allocUnsafe(size);
					};

					function fromString(string, encoding) {
						if (typeof encoding !== "string" || encoding === "") {
							encoding = "utf8";
						}

						if (!Buffer.isEncoding(encoding)) {
							throw new TypeError(
								"Unknown encoding: " + encoding
							);
						}

						var length = byteLength(string, encoding) | 0;
						var buf = createBuffer(length);

						var actual = buf.write(string, encoding);

						if (actual !== length) {
							// Writing a hex string, for example, that contains invalid characters will
							// cause everything after the first invalid character to be ignored. (e.g.
							// 'abxxcd' will be treated as 'ab')
							buf = buf.slice(0, actual);
						}

						return buf;
					}

					function fromArrayLike(array) {
						var length =
							array.length < 0 ? 0 : checked(array.length) | 0;
						var buf = createBuffer(length);
						for (var i = 0; i < length; i += 1) {
							buf[i] = array[i] & 255;
						}
						return buf;
					}

					function fromArrayBuffer(array, byteOffset, length) {
						if (byteOffset < 0 || array.byteLength < byteOffset) {
							throw new RangeError(
								'"offset" is outside of buffer bounds'
							);
						}

						if (array.byteLength < byteOffset + (length || 0)) {
							throw new RangeError(
								'"length" is outside of buffer bounds'
							);
						}

						var buf;
						if (byteOffset === undefined && length === undefined) {
							buf = new Uint8Array(array);
						} else if (length === undefined) {
							buf = new Uint8Array(array, byteOffset);
						} else {
							buf = new Uint8Array(array, byteOffset, length);
						}

						// Return an augmented `Uint8Array` instance
						Object.setPrototypeOf(buf, Buffer.prototype);

						return buf;
					}

					function fromObject(obj) {
						if (Buffer.isBuffer(obj)) {
							var len = checked(obj.length) | 0;
							var buf = createBuffer(len);

							if (buf.length === 0) {
								return buf;
							}

							obj.copy(buf, 0, 0, len);
							return buf;
						}

						if (obj.length !== undefined) {
							if (
								typeof obj.length !== "number" ||
								numberIsNaN(obj.length)
							) {
								return createBuffer(0);
							}
							return fromArrayLike(obj);
						}

						if (obj.type === "Buffer" && Array.isArray(obj.data)) {
							return fromArrayLike(obj.data);
						}
					}

					function checked(length) {
						// Note: cannot use `length < K_MAX_LENGTH` here because that fails when
						// length is NaN (which is otherwise coerced to zero.)
						if (length >= K_MAX_LENGTH) {
							throw new RangeError(
								"Attempt to allocate Buffer larger than maximum " +
									"size: 0x" +
									K_MAX_LENGTH.toString(16) +
									" bytes"
							);
						}
						return length | 0;
					}

					function SlowBuffer(length) {
						if (+length != length) {
							// eslint-disable-line eqeqeq
							length = 0;
						}
						return Buffer.alloc(+length);
					}

					Buffer.isBuffer = function isBuffer(b) {
						return (
							b != null &&
							b._isBuffer === true &&
							b !== Buffer.prototype
						); // so Buffer.isBuffer(Buffer.prototype) will be false
					};

					Buffer.compare = function compare(a, b) {
						if (isInstance(a, Uint8Array))
							a = Buffer.from(a, a.offset, a.byteLength);
						if (isInstance(b, Uint8Array))
							b = Buffer.from(b, b.offset, b.byteLength);
						if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
							throw new TypeError(
								'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
							);
						}

						if (a === b) return 0;

						var x = a.length;
						var y = b.length;

						for (var i = 0, len = Math.min(x, y); i < len; ++i) {
							if (a[i] !== b[i]) {
								x = a[i];
								y = b[i];
								break;
							}
						}

						if (x < y) return -1;
						if (y < x) return 1;
						return 0;
					};

					Buffer.isEncoding = function isEncoding(encoding) {
						switch (String(encoding).toLowerCase()) {
							case "hex":
							case "utf8":
							case "utf-8":
							case "ascii":
							case "latin1":
							case "binary":
							case "base64":
							case "ucs2":
							case "ucs-2":
							case "utf16le":
							case "utf-16le":
								return true;
							default:
								return false;
						}
					};

					Buffer.concat = function concat(list, length) {
						if (!Array.isArray(list)) {
							throw new TypeError(
								'"list" argument must be an Array of Buffers'
							);
						}

						if (list.length === 0) {
							return Buffer.alloc(0);
						}

						var i;
						if (length === undefined) {
							length = 0;
							for (i = 0; i < list.length; ++i) {
								length += list[i].length;
							}
						}

						var buffer = Buffer.allocUnsafe(length);
						var pos = 0;
						for (i = 0; i < list.length; ++i) {
							var buf = list[i];
							if (isInstance(buf, Uint8Array)) {
								buf = Buffer.from(buf);
							}
							if (!Buffer.isBuffer(buf)) {
								throw new TypeError(
									'"list" argument must be an Array of Buffers'
								);
							}
							buf.copy(buffer, pos);
							pos += buf.length;
						}
						return buffer;
					};

					function byteLength(string, encoding) {
						if (Buffer.isBuffer(string)) {
							return string.length;
						}
						if (
							ArrayBuffer.isView(string) ||
							isInstance(string, ArrayBuffer)
						) {
							return string.byteLength;
						}
						if (typeof string !== "string") {
							throw new TypeError(
								'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
									"Received type " +
									typeof string
							);
						}

						var len = string.length;
						var mustMatch =
							arguments.length > 2 && arguments[2] === true;
						if (!mustMatch && len === 0) return 0;

						// Use a for loop to avoid recursion
						var loweredCase = false;
						for (;;) {
							switch (encoding) {
								case "ascii":
								case "latin1":
								case "binary":
									return len;
								case "utf8":
								case "utf-8":
									return utf8ToBytes(string).length;
								case "ucs2":
								case "ucs-2":
								case "utf16le":
								case "utf-16le":
									return len * 2;
								case "hex":
									return len >>> 1;
								case "base64":
									return base64ToBytes(string).length;
								default:
									if (loweredCase) {
										return mustMatch
											? -1
											: utf8ToBytes(string).length; // assume utf8
									}
									encoding = ("" + encoding).toLowerCase();
									loweredCase = true;
							}
						}
					}
					Buffer.byteLength = byteLength;

					function slowToString(encoding, start, end) {
						var loweredCase = false;

						// No need to verify that "this.length <= MAX_UINT32" since it's a read-only
						// property of a typed array.

						// This behaves neither like String nor Uint8Array in that we set start/end
						// to their upper/lower bounds if the value passed is out of range.
						// undefined is handled specially as per ECMA-262 6th Edition,
						// Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
						if (start === undefined || start < 0) {
							start = 0;
						}
						// Return early if start > this.length. Done here to prevent potential uint32
						// coercion fail below.
						if (start > this.length) {
							return "";
						}

						if (end === undefined || end > this.length) {
							end = this.length;
						}

						if (end <= 0) {
							return "";
						}

						// Force coersion to uint32. This will also coerce falsey/NaN values to 0.
						end >>>= 0;
						start >>>= 0;

						if (end <= start) {
							return "";
						}

						if (!encoding) encoding = "utf8";

						while (true) {
							switch (encoding) {
								case "hex":
									return hexSlice(this, start, end);

								case "utf8":
								case "utf-8":
									return utf8Slice(this, start, end);

								case "ascii":
									return asciiSlice(this, start, end);

								case "latin1":
								case "binary":
									return latin1Slice(this, start, end);

								case "base64":
									return base64Slice(this, start, end);

								case "ucs2":
								case "ucs-2":
								case "utf16le":
								case "utf-16le":
									return utf16leSlice(this, start, end);

								default:
									if (loweredCase)
										throw new TypeError(
											"Unknown encoding: " + encoding
										);
									encoding = (encoding + "").toLowerCase();
									loweredCase = true;
							}
						}
					}

					// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
					// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
					// reliably in a browserify context because there could be multiple different
					// copies of the 'buffer' package in use. This method works even for Buffer
					// instances that were created from another copy of the `buffer` package.
					// See: https://github.com/feross/buffer/issues/154
					Buffer.prototype._isBuffer = true;

					function swap(b, n, m) {
						var i = b[n];
						b[n] = b[m];
						b[m] = i;
					}

					Buffer.prototype.swap16 = function swap16() {
						var len = this.length;
						if (len % 2 !== 0) {
							throw new RangeError(
								"Buffer size must be a multiple of 16-bits"
							);
						}
						for (var i = 0; i < len; i += 2) {
							swap(this, i, i + 1);
						}
						return this;
					};

					Buffer.prototype.swap32 = function swap32() {
						var len = this.length;
						if (len % 4 !== 0) {
							throw new RangeError(
								"Buffer size must be a multiple of 32-bits"
							);
						}
						for (var i = 0; i < len; i += 4) {
							swap(this, i, i + 3);
							swap(this, i + 1, i + 2);
						}
						return this;
					};

					Buffer.prototype.swap64 = function swap64() {
						var len = this.length;
						if (len % 8 !== 0) {
							throw new RangeError(
								"Buffer size must be a multiple of 64-bits"
							);
						}
						for (var i = 0; i < len; i += 8) {
							swap(this, i, i + 7);
							swap(this, i + 1, i + 6);
							swap(this, i + 2, i + 5);
							swap(this, i + 3, i + 4);
						}
						return this;
					};

					Buffer.prototype.toString = function toString() {
						var length = this.length;
						if (length === 0) return "";
						if (arguments.length === 0)
							return utf8Slice(this, 0, length);
						return slowToString.apply(this, arguments);
					};

					Buffer.prototype.toLocaleString = Buffer.prototype.toString;

					Buffer.prototype.equals = function equals(b) {
						if (!Buffer.isBuffer(b))
							throw new TypeError("Argument must be a Buffer");
						if (this === b) return true;
						return Buffer.compare(this, b) === 0;
					};

					Buffer.prototype.inspect = function inspect() {
						var str = "";
						var max = exports.INSPECT_MAX_BYTES;
						str = this.toString("hex", 0, max)
							.replace(/(.{2})/g, "$1 ")
							.trim();
						if (this.length > max) str += " ... ";
						return "<Buffer " + str + ">";
					};
					if (customInspectSymbol) {
						Buffer.prototype[customInspectSymbol] =
							Buffer.prototype.inspect;
					}

					Buffer.prototype.compare = function compare(
						target,
						start,
						end,
						thisStart,
						thisEnd
					) {
						if (isInstance(target, Uint8Array)) {
							target = Buffer.from(
								target,
								target.offset,
								target.byteLength
							);
						}
						if (!Buffer.isBuffer(target)) {
							throw new TypeError(
								'The "target" argument must be one of type Buffer or Uint8Array. ' +
									"Received type " +
									typeof target
							);
						}

						if (start === undefined) {
							start = 0;
						}
						if (end === undefined) {
							end = target ? target.length : 0;
						}
						if (thisStart === undefined) {
							thisStart = 0;
						}
						if (thisEnd === undefined) {
							thisEnd = this.length;
						}

						if (
							start < 0 ||
							end > target.length ||
							thisStart < 0 ||
							thisEnd > this.length
						) {
							throw new RangeError("out of range index");
						}

						if (thisStart >= thisEnd && start >= end) {
							return 0;
						}
						if (thisStart >= thisEnd) {
							return -1;
						}
						if (start >= end) {
							return 1;
						}

						start >>>= 0;
						end >>>= 0;
						thisStart >>>= 0;
						thisEnd >>>= 0;

						if (this === target) return 0;

						var x = thisEnd - thisStart;
						var y = end - start;
						var len = Math.min(x, y);

						var thisCopy = this.slice(thisStart, thisEnd);
						var targetCopy = target.slice(start, end);

						for (var i = 0; i < len; ++i) {
							if (thisCopy[i] !== targetCopy[i]) {
								x = thisCopy[i];
								y = targetCopy[i];
								break;
							}
						}

						if (x < y) return -1;
						if (y < x) return 1;
						return 0;
					};

					// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
					// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
					//
					// Arguments:
					// - buffer - a Buffer to search
					// - val - a string, Buffer, or number
					// - byteOffset - an index into `buffer`; will be clamped to an int32
					// - encoding - an optional encoding, relevant is val is a string
					// - dir - true for indexOf, false for lastIndexOf
					function bidirectionalIndexOf(
						buffer,
						val,
						byteOffset,
						encoding,
						dir
					) {
						// Empty buffer means no match
						if (buffer.length === 0) return -1;

						// Normalize byteOffset
						if (typeof byteOffset === "string") {
							encoding = byteOffset;
							byteOffset = 0;
						} else if (byteOffset > 0x7fffffff) {
							byteOffset = 0x7fffffff;
						} else if (byteOffset < -0x80000000) {
							byteOffset = -0x80000000;
						}
						byteOffset = +byteOffset; // Coerce to Number.
						if (numberIsNaN(byteOffset)) {
							// byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
							byteOffset = dir ? 0 : buffer.length - 1;
						}

						// Normalize byteOffset: negative offsets start from the end of the buffer
						if (byteOffset < 0)
							byteOffset = buffer.length + byteOffset;
						if (byteOffset >= buffer.length) {
							if (dir) return -1;
							else byteOffset = buffer.length - 1;
						} else if (byteOffset < 0) {
							if (dir) byteOffset = 0;
							else return -1;
						}

						// Normalize val
						if (typeof val === "string") {
							val = Buffer.from(val, encoding);
						}

						// Finally, search either indexOf (if dir is true) or lastIndexOf
						if (Buffer.isBuffer(val)) {
							// Special case: looking for empty string/buffer always fails
							if (val.length === 0) {
								return -1;
							}
							return arrayIndexOf(
								buffer,
								val,
								byteOffset,
								encoding,
								dir
							);
						} else if (typeof val === "number") {
							val = val & 0xff; // Search for a byte value [0-255]
							if (
								typeof Uint8Array.prototype.indexOf ===
								"function"
							) {
								if (dir) {
									return Uint8Array.prototype.indexOf.call(
										buffer,
										val,
										byteOffset
									);
								} else {
									return Uint8Array.prototype.lastIndexOf.call(
										buffer,
										val,
										byteOffset
									);
								}
							}
							return arrayIndexOf(
								buffer,
								[val],
								byteOffset,
								encoding,
								dir
							);
						}

						throw new TypeError(
							"val must be string, number or Buffer"
						);
					}

					function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
						var indexSize = 1;
						var arrLength = arr.length;
						var valLength = val.length;

						if (encoding !== undefined) {
							encoding = String(encoding).toLowerCase();
							if (
								encoding === "ucs2" ||
								encoding === "ucs-2" ||
								encoding === "utf16le" ||
								encoding === "utf-16le"
							) {
								if (arr.length < 2 || val.length < 2) {
									return -1;
								}
								indexSize = 2;
								arrLength /= 2;
								valLength /= 2;
								byteOffset /= 2;
							}
						}

						function read(buf, i) {
							if (indexSize === 1) {
								return buf[i];
							} else {
								return buf.readUInt16BE(i * indexSize);
							}
						}

						var i;
						if (dir) {
							var foundIndex = -1;
							for (i = byteOffset; i < arrLength; i++) {
								if (
									read(arr, i) ===
									read(
										val,
										foundIndex === -1 ? 0 : i - foundIndex
									)
								) {
									if (foundIndex === -1) foundIndex = i;
									if (i - foundIndex + 1 === valLength)
										return foundIndex * indexSize;
								} else {
									if (foundIndex !== -1) i -= i - foundIndex;
									foundIndex = -1;
								}
							}
						} else {
							if (byteOffset + valLength > arrLength)
								byteOffset = arrLength - valLength;
							for (i = byteOffset; i >= 0; i--) {
								var found = true;
								for (var j = 0; j < valLength; j++) {
									if (read(arr, i + j) !== read(val, j)) {
										found = false;
										break;
									}
								}
								if (found) return i;
							}
						}

						return -1;
					}

					Buffer.prototype.includes = function includes(
						val,
						byteOffset,
						encoding
					) {
						return this.indexOf(val, byteOffset, encoding) !== -1;
					};

					Buffer.prototype.indexOf = function indexOf(
						val,
						byteOffset,
						encoding
					) {
						return bidirectionalIndexOf(
							this,
							val,
							byteOffset,
							encoding,
							true
						);
					};

					Buffer.prototype.lastIndexOf = function lastIndexOf(
						val,
						byteOffset,
						encoding
					) {
						return bidirectionalIndexOf(
							this,
							val,
							byteOffset,
							encoding,
							false
						);
					};

					function hexWrite(buf, string, offset, length) {
						offset = Number(offset) || 0;
						var remaining = buf.length - offset;
						if (!length) {
							length = remaining;
						} else {
							length = Number(length);
							if (length > remaining) {
								length = remaining;
							}
						}

						var strLen = string.length;

						if (length > strLen / 2) {
							length = strLen / 2;
						}
						for (var i = 0; i < length; ++i) {
							var parsed = parseInt(string.substr(i * 2, 2), 16);
							if (numberIsNaN(parsed)) return i;
							buf[offset + i] = parsed;
						}
						return i;
					}

					function utf8Write(buf, string, offset, length) {
						return blitBuffer(
							utf8ToBytes(string, buf.length - offset),
							buf,
							offset,
							length
						);
					}

					function asciiWrite(buf, string, offset, length) {
						return blitBuffer(
							asciiToBytes(string),
							buf,
							offset,
							length
						);
					}

					function latin1Write(buf, string, offset, length) {
						return asciiWrite(buf, string, offset, length);
					}

					function base64Write(buf, string, offset, length) {
						return blitBuffer(
							base64ToBytes(string),
							buf,
							offset,
							length
						);
					}

					function ucs2Write(buf, string, offset, length) {
						return blitBuffer(
							utf16leToBytes(string, buf.length - offset),
							buf,
							offset,
							length
						);
					}

					Buffer.prototype.write = function write(
						string,
						offset,
						length,
						encoding
					) {
						// Buffer#write(string)
						if (offset === undefined) {
							encoding = "utf8";
							length = this.length;
							offset = 0;
							// Buffer#write(string, encoding)
						} else if (
							length === undefined &&
							typeof offset === "string"
						) {
							encoding = offset;
							length = this.length;
							offset = 0;
							// Buffer#write(string, offset[, length][, encoding])
						} else if (isFinite(offset)) {
							offset = offset >>> 0;
							if (isFinite(length)) {
								length = length >>> 0;
								if (encoding === undefined) encoding = "utf8";
							} else {
								encoding = length;
								length = undefined;
							}
						} else {
							throw new Error(
								"Buffer.write(string, encoding, offset[, length]) is no longer supported"
							);
						}

						var remaining = this.length - offset;
						if (length === undefined || length > remaining)
							length = remaining;

						if (
							(string.length > 0 && (length < 0 || offset < 0)) ||
							offset > this.length
						) {
							throw new RangeError(
								"Attempt to write outside buffer bounds"
							);
						}

						if (!encoding) encoding = "utf8";

						var loweredCase = false;
						for (;;) {
							switch (encoding) {
								case "hex":
									return hexWrite(
										this,
										string,
										offset,
										length
									);

								case "utf8":
								case "utf-8":
									return utf8Write(
										this,
										string,
										offset,
										length
									);

								case "ascii":
									return asciiWrite(
										this,
										string,
										offset,
										length
									);

								case "latin1":
								case "binary":
									return latin1Write(
										this,
										string,
										offset,
										length
									);

								case "base64":
									// Warning: maxLength not taken into account in base64Write
									return base64Write(
										this,
										string,
										offset,
										length
									);

								case "ucs2":
								case "ucs-2":
								case "utf16le":
								case "utf-16le":
									return ucs2Write(
										this,
										string,
										offset,
										length
									);

								default:
									if (loweredCase)
										throw new TypeError(
											"Unknown encoding: " + encoding
										);
									encoding = ("" + encoding).toLowerCase();
									loweredCase = true;
							}
						}
					};

					Buffer.prototype.toJSON = function toJSON() {
						return {
							type: "Buffer",
							data: Array.prototype.slice.call(
								this._arr || this,
								0
							),
						};
					};

					function base64Slice(buf, start, end) {
						if (start === 0 && end === buf.length) {
							return base64.fromByteArray(buf);
						} else {
							return base64.fromByteArray(buf.slice(start, end));
						}
					}

					function utf8Slice(buf, start, end) {
						end = Math.min(buf.length, end);
						var res = [];

						var i = start;
						while (i < end) {
							var firstByte = buf[i];
							var codePoint = null;
							var bytesPerSequence =
								firstByte > 0xef
									? 4
									: firstByte > 0xdf
									? 3
									: firstByte > 0xbf
									? 2
									: 1;

							if (i + bytesPerSequence <= end) {
								var secondByte,
									thirdByte,
									fourthByte,
									tempCodePoint;

								switch (bytesPerSequence) {
									case 1:
										if (firstByte < 0x80) {
											codePoint = firstByte;
										}
										break;
									case 2:
										secondByte = buf[i + 1];
										if ((secondByte & 0xc0) === 0x80) {
											tempCodePoint =
												((firstByte & 0x1f) << 0x6) |
												(secondByte & 0x3f);
											if (tempCodePoint > 0x7f) {
												codePoint = tempCodePoint;
											}
										}
										break;
									case 3:
										secondByte = buf[i + 1];
										thirdByte = buf[i + 2];
										if (
											(secondByte & 0xc0) === 0x80 &&
											(thirdByte & 0xc0) === 0x80
										) {
											tempCodePoint =
												((firstByte & 0xf) << 0xc) |
												((secondByte & 0x3f) << 0x6) |
												(thirdByte & 0x3f);
											if (
												tempCodePoint > 0x7ff &&
												(tempCodePoint < 0xd800 ||
													tempCodePoint > 0xdfff)
											) {
												codePoint = tempCodePoint;
											}
										}
										break;
									case 4:
										secondByte = buf[i + 1];
										thirdByte = buf[i + 2];
										fourthByte = buf[i + 3];
										if (
											(secondByte & 0xc0) === 0x80 &&
											(thirdByte & 0xc0) === 0x80 &&
											(fourthByte & 0xc0) === 0x80
										) {
											tempCodePoint =
												((firstByte & 0xf) << 0x12) |
												((secondByte & 0x3f) << 0xc) |
												((thirdByte & 0x3f) << 0x6) |
												(fourthByte & 0x3f);
											if (
												tempCodePoint > 0xffff &&
												tempCodePoint < 0x110000
											) {
												codePoint = tempCodePoint;
											}
										}
								}
							}

							if (codePoint === null) {
								// we did not generate a valid codePoint so insert a
								// replacement char (U+FFFD) and advance only 1 byte
								codePoint = 0xfffd;
								bytesPerSequence = 1;
							} else if (codePoint > 0xffff) {
								// encode to utf16 (surrogate pair dance)
								codePoint -= 0x10000;
								res.push(((codePoint >>> 10) & 0x3ff) | 0xd800);
								codePoint = 0xdc00 | (codePoint & 0x3ff);
							}

							res.push(codePoint);
							i += bytesPerSequence;
						}

						return decodeCodePointsArray(res);
					}

					// Based on http://stackoverflow.com/a/22747272/680742, the browser with
					// the lowest limit is Chrome, with 0x10000 args.
					// We go 1 magnitude less, for safety
					var MAX_ARGUMENTS_LENGTH = 0x1000;

					function decodeCodePointsArray(codePoints) {
						var len = codePoints.length;
						if (len <= MAX_ARGUMENTS_LENGTH) {
							return String.fromCharCode.apply(
								String,
								codePoints
							); // avoid extra slice()
						}

						// Decode in chunks to avoid "call stack size exceeded".
						var res = "";
						var i = 0;
						while (i < len) {
							res += String.fromCharCode.apply(
								String,
								codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH))
							);
						}
						return res;
					}

					function asciiSlice(buf, start, end) {
						var ret = "";
						end = Math.min(buf.length, end);

						for (var i = start; i < end; ++i) {
							ret += String.fromCharCode(buf[i] & 0x7f);
						}
						return ret;
					}

					function latin1Slice(buf, start, end) {
						var ret = "";
						end = Math.min(buf.length, end);

						for (var i = start; i < end; ++i) {
							ret += String.fromCharCode(buf[i]);
						}
						return ret;
					}

					function hexSlice(buf, start, end) {
						var len = buf.length;

						if (!start || start < 0) start = 0;
						if (!end || end < 0 || end > len) end = len;

						var out = "";
						for (var i = start; i < end; ++i) {
							out += toHex(buf[i]);
						}
						return out;
					}

					function utf16leSlice(buf, start, end) {
						var bytes = buf.slice(start, end);
						var res = "";
						for (var i = 0; i < bytes.length; i += 2) {
							res += String.fromCharCode(
								bytes[i] + bytes[i + 1] * 256
							);
						}
						return res;
					}

					Buffer.prototype.slice = function slice(start, end) {
						var len = this.length;
						start = ~~start;
						end = end === undefined ? len : ~~end;

						if (start < 0) {
							start += len;
							if (start < 0) start = 0;
						} else if (start > len) {
							start = len;
						}

						if (end < 0) {
							end += len;
							if (end < 0) end = 0;
						} else if (end > len) {
							end = len;
						}

						if (end < start) end = start;

						var newBuf = this.subarray(start, end);
						// Return an augmented `Uint8Array` instance
						Object.setPrototypeOf(newBuf, Buffer.prototype);

						return newBuf;
					};

					/*
					 * Need to make sure that buffer isn't trying to write out of bounds.
					 */
					function checkOffset(offset, ext, length) {
						if (offset % 1 !== 0 || offset < 0)
							throw new RangeError("offset is not uint");
						if (offset + ext > length)
							throw new RangeError(
								"Trying to access beyond buffer length"
							);
					}

					Buffer.prototype.readUIntLE = function readUIntLE(
						offset,
						byteLength,
						noAssert
					) {
						offset = offset >>> 0;
						byteLength = byteLength >>> 0;
						if (!noAssert)
							checkOffset(offset, byteLength, this.length);

						var val = this[offset];
						var mul = 1;
						var i = 0;
						while (++i < byteLength && (mul *= 0x100)) {
							val += this[offset + i] * mul;
						}

						return val;
					};

					Buffer.prototype.readUIntBE = function readUIntBE(
						offset,
						byteLength,
						noAssert
					) {
						offset = offset >>> 0;
						byteLength = byteLength >>> 0;
						if (!noAssert) {
							checkOffset(offset, byteLength, this.length);
						}

						var val = this[offset + --byteLength];
						var mul = 1;
						while (byteLength > 0 && (mul *= 0x100)) {
							val += this[offset + --byteLength] * mul;
						}

						return val;
					};

					Buffer.prototype.readUInt8 = function readUInt8(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 1, this.length);
						return this[offset];
					};

					Buffer.prototype.readUInt16LE = function readUInt16LE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 2, this.length);
						return this[offset] | (this[offset + 1] << 8);
					};

					Buffer.prototype.readUInt16BE = function readUInt16BE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 2, this.length);
						return (this[offset] << 8) | this[offset + 1];
					};

					Buffer.prototype.readUInt32LE = function readUInt32LE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 4, this.length);

						return (
							(this[offset] |
								(this[offset + 1] << 8) |
								(this[offset + 2] << 16)) +
							this[offset + 3] * 0x1000000
						);
					};

					Buffer.prototype.readUInt32BE = function readUInt32BE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 4, this.length);

						return (
							this[offset] * 0x1000000 +
							((this[offset + 1] << 16) |
								(this[offset + 2] << 8) |
								this[offset + 3])
						);
					};

					Buffer.prototype.readIntLE = function readIntLE(
						offset,
						byteLength,
						noAssert
					) {
						offset = offset >>> 0;
						byteLength = byteLength >>> 0;
						if (!noAssert)
							checkOffset(offset, byteLength, this.length);

						var val = this[offset];
						var mul = 1;
						var i = 0;
						while (++i < byteLength && (mul *= 0x100)) {
							val += this[offset + i] * mul;
						}
						mul *= 0x80;

						if (val >= mul) val -= Math.pow(2, 8 * byteLength);

						return val;
					};

					Buffer.prototype.readIntBE = function readIntBE(
						offset,
						byteLength,
						noAssert
					) {
						offset = offset >>> 0;
						byteLength = byteLength >>> 0;
						if (!noAssert)
							checkOffset(offset, byteLength, this.length);

						var i = byteLength;
						var mul = 1;
						var val = this[offset + --i];
						while (i > 0 && (mul *= 0x100)) {
							val += this[offset + --i] * mul;
						}
						mul *= 0x80;

						if (val >= mul) val -= Math.pow(2, 8 * byteLength);

						return val;
					};

					Buffer.prototype.readInt8 = function readInt8(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 1, this.length);
						if (!(this[offset] & 0x80)) return this[offset];
						return (0xff - this[offset] + 1) * -1;
					};

					Buffer.prototype.readInt16LE = function readInt16LE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 2, this.length);
						var val = this[offset] | (this[offset + 1] << 8);
						return val & 0x8000 ? val | 0xffff0000 : val;
					};

					Buffer.prototype.readInt16BE = function readInt16BE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 2, this.length);
						var val = this[offset + 1] | (this[offset] << 8);
						return val & 0x8000 ? val | 0xffff0000 : val;
					};

					Buffer.prototype.readInt32LE = function readInt32LE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 4, this.length);

						return (
							this[offset] |
							(this[offset + 1] << 8) |
							(this[offset + 2] << 16) |
							(this[offset + 3] << 24)
						);
					};

					Buffer.prototype.readInt32BE = function readInt32BE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 4, this.length);

						return (
							(this[offset] << 24) |
							(this[offset + 1] << 16) |
							(this[offset + 2] << 8) |
							this[offset + 3]
						);
					};

					Buffer.prototype.readFloatLE = function readFloatLE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 4, this.length);
						return ieee754.read(this, offset, true, 23, 4);
					};

					Buffer.prototype.readFloatBE = function readFloatBE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 4, this.length);
						return ieee754.read(this, offset, false, 23, 4);
					};

					Buffer.prototype.readDoubleLE = function readDoubleLE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 8, this.length);
						return ieee754.read(this, offset, true, 52, 8);
					};

					Buffer.prototype.readDoubleBE = function readDoubleBE(
						offset,
						noAssert
					) {
						offset = offset >>> 0;
						if (!noAssert) checkOffset(offset, 8, this.length);
						return ieee754.read(this, offset, false, 52, 8);
					};

					function checkInt(buf, value, offset, ext, max, min) {
						if (!Buffer.isBuffer(buf))
							throw new TypeError(
								'"buffer" argument must be a Buffer instance'
							);
						if (value > max || value < min)
							throw new RangeError(
								'"value" argument is out of bounds'
							);
						if (offset + ext > buf.length)
							throw new RangeError("Index out of range");
					}

					Buffer.prototype.writeUIntLE = function writeUIntLE(
						value,
						offset,
						byteLength,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						byteLength = byteLength >>> 0;
						if (!noAssert) {
							var maxBytes = Math.pow(2, 8 * byteLength) - 1;
							checkInt(
								this,
								value,
								offset,
								byteLength,
								maxBytes,
								0
							);
						}

						var mul = 1;
						var i = 0;
						this[offset] = value & 0xff;
						while (++i < byteLength && (mul *= 0x100)) {
							this[offset + i] = (value / mul) & 0xff;
						}

						return offset + byteLength;
					};

					Buffer.prototype.writeUIntBE = function writeUIntBE(
						value,
						offset,
						byteLength,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						byteLength = byteLength >>> 0;
						if (!noAssert) {
							var maxBytes = Math.pow(2, 8 * byteLength) - 1;
							checkInt(
								this,
								value,
								offset,
								byteLength,
								maxBytes,
								0
							);
						}

						var i = byteLength - 1;
						var mul = 1;
						this[offset + i] = value & 0xff;
						while (--i >= 0 && (mul *= 0x100)) {
							this[offset + i] = (value / mul) & 0xff;
						}

						return offset + byteLength;
					};

					Buffer.prototype.writeUInt8 = function writeUInt8(
						value,
						offset,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert)
							checkInt(this, value, offset, 1, 0xff, 0);
						this[offset] = value & 0xff;
						return offset + 1;
					};

					Buffer.prototype.writeUInt16LE = function writeUInt16LE(
						value,
						offset,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert)
							checkInt(this, value, offset, 2, 0xffff, 0);
						this[offset] = value & 0xff;
						this[offset + 1] = value >>> 8;
						return offset + 2;
					};

					Buffer.prototype.writeUInt16BE = function writeUInt16BE(
						value,
						offset,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert)
							checkInt(this, value, offset, 2, 0xffff, 0);
						this[offset] = value >>> 8;
						this[offset + 1] = value & 0xff;
						return offset + 2;
					};

					Buffer.prototype.writeUInt32LE = function writeUInt32LE(
						value,
						offset,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert)
							checkInt(this, value, offset, 4, 0xffffffff, 0);
						this[offset + 3] = value >>> 24;
						this[offset + 2] = value >>> 16;
						this[offset + 1] = value >>> 8;
						this[offset] = value & 0xff;
						return offset + 4;
					};

					Buffer.prototype.writeUInt32BE = function writeUInt32BE(
						value,
						offset,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert)
							checkInt(this, value, offset, 4, 0xffffffff, 0);
						this[offset] = value >>> 24;
						this[offset + 1] = value >>> 16;
						this[offset + 2] = value >>> 8;
						this[offset + 3] = value & 0xff;
						return offset + 4;
					};

					Buffer.prototype.writeIntLE = function writeIntLE(
						value,
						offset,
						byteLength,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert) {
							var limit = Math.pow(2, 8 * byteLength - 1);

							checkInt(
								this,
								value,
								offset,
								byteLength,
								limit - 1,
								-limit
							);
						}

						var i = 0;
						var mul = 1;
						var sub = 0;
						this[offset] = value & 0xff;
						while (++i < byteLength && (mul *= 0x100)) {
							if (
								value < 0 &&
								sub === 0 &&
								this[offset + i - 1] !== 0
							) {
								sub = 1;
							}
							this[offset + i] =
								(((value / mul) >> 0) - sub) & 0xff;
						}

						return offset + byteLength;
					};

					Buffer.prototype.writeIntBE = function writeIntBE(
						value,
						offset,
						byteLength,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert) {
							var limit = Math.pow(2, 8 * byteLength - 1);

							checkInt(
								this,
								value,
								offset,
								byteLength,
								limit - 1,
								-limit
							);
						}

						var i = byteLength - 1;
						var mul = 1;
						var sub = 0;
						this[offset + i] = value & 0xff;
						while (--i >= 0 && (mul *= 0x100)) {
							if (
								value < 0 &&
								sub === 0 &&
								this[offset + i + 1] !== 0
							) {
								sub = 1;
							}
							this[offset + i] =
								(((value / mul) >> 0) - sub) & 0xff;
						}

						return offset + byteLength;
					};

					Buffer.prototype.writeInt8 = function writeInt8(
						value,
						offset,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert)
							checkInt(this, value, offset, 1, 0x7f, -0x80);
						if (value < 0) value = 0xff + value + 1;
						this[offset] = value & 0xff;
						return offset + 1;
					};

					Buffer.prototype.writeInt16LE = function writeInt16LE(
						value,
						offset,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert)
							checkInt(this, value, offset, 2, 0x7fff, -0x8000);
						this[offset] = value & 0xff;
						this[offset + 1] = value >>> 8;
						return offset + 2;
					};

					Buffer.prototype.writeInt16BE = function writeInt16BE(
						value,
						offset,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert)
							checkInt(this, value, offset, 2, 0x7fff, -0x8000);
						this[offset] = value >>> 8;
						this[offset + 1] = value & 0xff;
						return offset + 2;
					};

					Buffer.prototype.writeInt32LE = function writeInt32LE(
						value,
						offset,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert)
							checkInt(
								this,
								value,
								offset,
								4,
								0x7fffffff,
								-0x80000000
							);
						this[offset] = value & 0xff;
						this[offset + 1] = value >>> 8;
						this[offset + 2] = value >>> 16;
						this[offset + 3] = value >>> 24;
						return offset + 4;
					};

					Buffer.prototype.writeInt32BE = function writeInt32BE(
						value,
						offset,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert)
							checkInt(
								this,
								value,
								offset,
								4,
								0x7fffffff,
								-0x80000000
							);
						if (value < 0) value = 0xffffffff + value + 1;
						this[offset] = value >>> 24;
						this[offset + 1] = value >>> 16;
						this[offset + 2] = value >>> 8;
						this[offset + 3] = value & 0xff;
						return offset + 4;
					};

					function checkIEEE754(buf, value, offset, ext, max, min) {
						if (offset + ext > buf.length)
							throw new RangeError("Index out of range");
						if (offset < 0)
							throw new RangeError("Index out of range");
					}

					function writeFloat(
						buf,
						value,
						offset,
						littleEndian,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert) {
							checkIEEE754(
								buf,
								value,
								offset,
								4,
								3.4028234663852886e38,
								-3.4028234663852886e38
							);
						}
						ieee754.write(buf, value, offset, littleEndian, 23, 4);
						return offset + 4;
					}

					Buffer.prototype.writeFloatLE = function writeFloatLE(
						value,
						offset,
						noAssert
					) {
						return writeFloat(this, value, offset, true, noAssert);
					};

					Buffer.prototype.writeFloatBE = function writeFloatBE(
						value,
						offset,
						noAssert
					) {
						return writeFloat(this, value, offset, false, noAssert);
					};

					function writeDouble(
						buf,
						value,
						offset,
						littleEndian,
						noAssert
					) {
						value = +value;
						offset = offset >>> 0;
						if (!noAssert) {
							checkIEEE754(
								buf,
								value,
								offset,
								8,
								1.7976931348623157e308,
								-1.7976931348623157e308
							);
						}
						ieee754.write(buf, value, offset, littleEndian, 52, 8);
						return offset + 8;
					}

					Buffer.prototype.writeDoubleLE = function writeDoubleLE(
						value,
						offset,
						noAssert
					) {
						return writeDouble(this, value, offset, true, noAssert);
					};

					Buffer.prototype.writeDoubleBE = function writeDoubleBE(
						value,
						offset,
						noAssert
					) {
						return writeDouble(
							this,
							value,
							offset,
							false,
							noAssert
						);
					};

					// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
					Buffer.prototype.copy = function copy(
						target,
						targetStart,
						start,
						end
					) {
						if (!Buffer.isBuffer(target))
							throw new TypeError("argument should be a Buffer");
						if (!start) start = 0;
						if (!end && end !== 0) end = this.length;
						if (targetStart >= target.length)
							targetStart = target.length;
						if (!targetStart) targetStart = 0;
						if (end > 0 && end < start) end = start;

						// Copy 0 bytes; we're done
						if (end === start) return 0;
						if (target.length === 0 || this.length === 0) return 0;

						// Fatal error conditions
						if (targetStart < 0) {
							throw new RangeError("targetStart out of bounds");
						}
						if (start < 0 || start >= this.length)
							throw new RangeError("Index out of range");
						if (end < 0)
							throw new RangeError("sourceEnd out of bounds");

						// Are we oob?
						if (end > this.length) end = this.length;
						if (target.length - targetStart < end - start) {
							end = target.length - targetStart + start;
						}

						var len = end - start;

						if (
							this === target &&
							typeof Uint8Array.prototype.copyWithin ===
								"function"
						) {
							// Use built-in when available, missing from IE11
							this.copyWithin(targetStart, start, end);
						} else if (
							this === target &&
							start < targetStart &&
							targetStart < end
						) {
							// descending copy from end
							for (var i = len - 1; i >= 0; --i) {
								target[i + targetStart] = this[i + start];
							}
						} else {
							Uint8Array.prototype.set.call(
								target,
								this.subarray(start, end),
								targetStart
							);
						}

						return len;
					};

					// Usage:
					//    buffer.fill(number[, offset[, end]])
					//    buffer.fill(buffer[, offset[, end]])
					//    buffer.fill(string[, offset[, end]][, encoding])
					Buffer.prototype.fill = function fill(
						val,
						start,
						end,
						encoding
					) {
						// Handle string cases:
						if (typeof val === "string") {
							if (typeof start === "string") {
								encoding = start;
								start = 0;
								end = this.length;
							} else if (typeof end === "string") {
								encoding = end;
								end = this.length;
							}
							if (
								encoding !== undefined &&
								typeof encoding !== "string"
							) {
								throw new TypeError(
									"encoding must be a string"
								);
							}
							if (
								typeof encoding === "string" &&
								!Buffer.isEncoding(encoding)
							) {
								throw new TypeError(
									"Unknown encoding: " + encoding
								);
							}
							if (val.length === 1) {
								var code = val.charCodeAt(0);
								if (
									(encoding === "utf8" && code < 128) ||
									encoding === "latin1"
								) {
									// Fast path: If `val` fits into a single byte, use that numeric value.
									val = code;
								}
							}
						} else if (typeof val === "number") {
							val = val & 255;
						} else if (typeof val === "boolean") {
							val = Number(val);
						}

						// Invalid ranges are not set to a default, so can range check early.
						if (
							start < 0 ||
							this.length < start ||
							this.length < end
						) {
							throw new RangeError("Out of range index");
						}

						if (end <= start) {
							return this;
						}

						start = start >>> 0;
						end = end === undefined ? this.length : end >>> 0;

						if (!val) val = 0;

						var i;
						if (typeof val === "number") {
							for (i = start; i < end; ++i) {
								this[i] = val;
							}
						} else {
							var bytes = Buffer.isBuffer(val)
								? val
								: Buffer.from(val, encoding);
							var len = bytes.length;
							if (len === 0) {
								throw new TypeError(
									'The value "' +
										val +
										'" is invalid for argument "value"'
								);
							}
							for (i = 0; i < end - start; ++i) {
								this[i + start] = bytes[i % len];
							}
						}

						return this;
					};

					// HELPER FUNCTIONS
					// ================

					var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

					function base64clean(str) {
						// Node takes equal signs as end of the Base64 encoding
						str = str.split("=")[0];
						// Node strips out invalid characters like \n and \t from the string, base64-js does not
						str = str.trim().replace(INVALID_BASE64_RE, "");
						// Node converts strings with length < 2 to ''
						if (str.length < 2) return "";
						// Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
						while (str.length % 4 !== 0) {
							str = str + "=";
						}
						return str;
					}

					function toHex(n) {
						if (n < 16) return "0" + n.toString(16);
						return n.toString(16);
					}

					function utf8ToBytes(string, units) {
						units = units || Infinity;
						var codePoint;
						var length = string.length;
						var leadSurrogate = null;
						var bytes = [];

						for (var i = 0; i < length; ++i) {
							codePoint = string.charCodeAt(i);

							// is surrogate component
							if (codePoint > 0xd7ff && codePoint < 0xe000) {
								// last char was a lead
								if (!leadSurrogate) {
									// no lead yet
									if (codePoint > 0xdbff) {
										// unexpected trail
										if ((units -= 3) > -1)
											bytes.push(0xef, 0xbf, 0xbd);
										continue;
									} else if (i + 1 === length) {
										// unpaired lead
										if ((units -= 3) > -1)
											bytes.push(0xef, 0xbf, 0xbd);
										continue;
									}

									// valid lead
									leadSurrogate = codePoint;

									continue;
								}

								// 2 leads in a row
								if (codePoint < 0xdc00) {
									if ((units -= 3) > -1)
										bytes.push(0xef, 0xbf, 0xbd);
									leadSurrogate = codePoint;
									continue;
								}

								// valid surrogate pair
								codePoint =
									(((leadSurrogate - 0xd800) << 10) |
										(codePoint - 0xdc00)) +
									0x10000;
							} else if (leadSurrogate) {
								// valid bmp char, but last char was a lead
								if ((units -= 3) > -1)
									bytes.push(0xef, 0xbf, 0xbd);
							}

							leadSurrogate = null;

							// encode utf8
							if (codePoint < 0x80) {
								if ((units -= 1) < 0) break;
								bytes.push(codePoint);
							} else if (codePoint < 0x800) {
								if ((units -= 2) < 0) break;
								bytes.push(
									(codePoint >> 0x6) | 0xc0,
									(codePoint & 0x3f) | 0x80
								);
							} else if (codePoint < 0x10000) {
								if ((units -= 3) < 0) break;
								bytes.push(
									(codePoint >> 0xc) | 0xe0,
									((codePoint >> 0x6) & 0x3f) | 0x80,
									(codePoint & 0x3f) | 0x80
								);
							} else if (codePoint < 0x110000) {
								if ((units -= 4) < 0) break;
								bytes.push(
									(codePoint >> 0x12) | 0xf0,
									((codePoint >> 0xc) & 0x3f) | 0x80,
									((codePoint >> 0x6) & 0x3f) | 0x80,
									(codePoint & 0x3f) | 0x80
								);
							} else {
								throw new Error("Invalid code point");
							}
						}

						return bytes;
					}

					function asciiToBytes(str) {
						var byteArray = [];
						for (var i = 0; i < str.length; ++i) {
							// Node's code seems to be doing this and not & 0x7F..
							byteArray.push(str.charCodeAt(i) & 0xff);
						}
						return byteArray;
					}

					function utf16leToBytes(str, units) {
						var c, hi, lo;
						var byteArray = [];
						for (var i = 0; i < str.length; ++i) {
							if ((units -= 2) < 0) break;

							c = str.charCodeAt(i);
							hi = c >> 8;
							lo = c % 256;
							byteArray.push(lo);
							byteArray.push(hi);
						}

						return byteArray;
					}

					function base64ToBytes(str) {
						return base64.toByteArray(base64clean(str));
					}

					function blitBuffer(src, dst, offset, length) {
						for (var i = 0; i < length; ++i) {
							if (i + offset >= dst.length || i >= src.length)
								break;
							dst[i + offset] = src[i];
						}
						return i;
					}

					// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
					// the `instanceof` check but they should be treated as of that type.
					// See: https://github.com/feross/buffer/issues/166
					function isInstance(obj, type) {
						return (
							obj instanceof type ||
							(obj != null &&
								obj.constructor != null &&
								obj.constructor.name != null &&
								obj.constructor.name === type.name)
						);
					}
					function numberIsNaN(obj) {
						// For IE11 support
						return obj !== obj; // eslint-disable-line no-self-compare
					}
				}).call(this, require("buffer").Buffer);
			},
			{ "base64-js": 10, buffer: 16, ieee754: 19 },
		],
		17: [
			function (require, module, exports) {
				/**
				 * This is the common logic for both the Node.js and web browser
				 * implementations of `debug()`.
				 */

				function setup(env) {
					createDebug.debug = createDebug;
					createDebug.default = createDebug;
					createDebug.coerce = coerce;
					createDebug.disable = disable;
					createDebug.enable = enable;
					createDebug.enabled = enabled;
					createDebug.humanize = require("ms");

					Object.keys(env).forEach((key) => {
						createDebug[key] = env[key];
					});

					/**
					 * Active `debug` instances.
					 */
					createDebug.instances = [];

					/**
					 * The currently active debug mode names, and names to skip.
					 */

					createDebug.names = [];
					createDebug.skips = [];

					/**
					 * Map of special "%n" handling functions, for the debug "format" argument.
					 *
					 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
					 */
					createDebug.formatters = {};

					/**
					 * Selects a color for a debug namespace
					 * @param {String} namespace The namespace string for the for the debug instance to be colored
					 * @return {Number|String} An ANSI color code for the given namespace
					 * @api private
					 */
					function selectColor(namespace) {
						let hash = 0;

						for (let i = 0; i < namespace.length; i++) {
							hash = (hash << 5) - hash + namespace.charCodeAt(i);
							hash |= 0; // Convert to 32bit integer
						}

						return createDebug.colors[
							Math.abs(hash) % createDebug.colors.length
						];
					}
					createDebug.selectColor = selectColor;

					/**
					 * Create a debugger with the given `namespace`.
					 *
					 * @param {String} namespace
					 * @return {Function}
					 * @api public
					 */
					function createDebug(namespace) {
						let prevTime;

						function debug(...args) {
							// Disabled?
							if (!debug.enabled) {
								return;
							}

							const self = debug;

							// Set `diff` timestamp
							const curr = Number(new Date());
							const ms = curr - (prevTime || curr);
							self.diff = ms;
							self.prev = prevTime;
							self.curr = curr;
							prevTime = curr;

							args[0] = createDebug.coerce(args[0]);

							if (typeof args[0] !== "string") {
								// Anything else let's inspect with %O
								args.unshift("%O");
							}

							// Apply any `formatters` transformations
							let index = 0;
							args[0] = args[0].replace(
								/%([a-zA-Z%])/g,
								(match, format) => {
									// If we encounter an escaped % then don't increase the array index
									if (match === "%%") {
										return match;
									}
									index++;
									const formatter =
										createDebug.formatters[format];
									if (typeof formatter === "function") {
										const val = args[index];
										match = formatter.call(self, val);

										// Now we need to remove `args[index]` since it's inlined in the `format`
										args.splice(index, 1);
										index--;
									}
									return match;
								}
							);

							// Apply env-specific formatting (colors, etc.)
							createDebug.formatArgs.call(self, args);

							const logFn = self.log || createDebug.log;
							logFn.apply(self, args);
						}

						debug.namespace = namespace;
						debug.enabled = createDebug.enabled(namespace);
						debug.useColors = createDebug.useColors();
						debug.color = selectColor(namespace);
						debug.destroy = destroy;
						debug.extend = extend;
						// Debug.formatArgs = formatArgs;
						// debug.rawLog = rawLog;

						// env-specific initialization logic for debug instances
						if (typeof createDebug.init === "function") {
							createDebug.init(debug);
						}

						createDebug.instances.push(debug);

						return debug;
					}

					function destroy() {
						const index = createDebug.instances.indexOf(this);
						if (index !== -1) {
							createDebug.instances.splice(index, 1);
							return true;
						}
						return false;
					}

					function extend(namespace, delimiter) {
						const newDebug = createDebug(
							this.namespace +
								(typeof delimiter === "undefined"
									? ":"
									: delimiter) +
								namespace
						);
						newDebug.log = this.log;
						return newDebug;
					}

					/**
					 * Enables a debug mode by namespaces. This can include modes
					 * separated by a colon and wildcards.
					 *
					 * @param {String} namespaces
					 * @api public
					 */
					function enable(namespaces) {
						createDebug.save(namespaces);

						createDebug.names = [];
						createDebug.skips = [];

						let i;
						const split = (
							typeof namespaces === "string" ? namespaces : ""
						).split(/[\s,]+/);
						const len = split.length;

						for (i = 0; i < len; i++) {
							if (!split[i]) {
								// ignore empty strings
								continue;
							}

							namespaces = split[i].replace(/\*/g, ".*?");

							if (namespaces[0] === "-") {
								createDebug.skips.push(
									new RegExp("^" + namespaces.substr(1) + "$")
								);
							} else {
								createDebug.names.push(
									new RegExp("^" + namespaces + "$")
								);
							}
						}

						for (i = 0; i < createDebug.instances.length; i++) {
							const instance = createDebug.instances[i];
							instance.enabled = createDebug.enabled(
								instance.namespace
							);
						}
					}

					/**
					 * Disable debug output.
					 *
					 * @return {String} namespaces
					 * @api public
					 */
					function disable() {
						const namespaces = [
							...createDebug.names.map(toNamespace),
							...createDebug.skips
								.map(toNamespace)
								.map((namespace) => "-" + namespace),
						].join(",");
						createDebug.enable("");
						return namespaces;
					}

					/**
					 * Returns true if the given mode name is enabled, false otherwise.
					 *
					 * @param {String} name
					 * @return {Boolean}
					 * @api public
					 */
					function enabled(name) {
						if (name[name.length - 1] === "*") {
							return true;
						}

						let i;
						let len;

						for (
							i = 0, len = createDebug.skips.length;
							i < len;
							i++
						) {
							if (createDebug.skips[i].test(name)) {
								return false;
							}
						}

						for (
							i = 0, len = createDebug.names.length;
							i < len;
							i++
						) {
							if (createDebug.names[i].test(name)) {
								return true;
							}
						}

						return false;
					}

					/**
					 * Convert regexp to namespace
					 *
					 * @param {RegExp} regxep
					 * @return {String} namespace
					 * @api private
					 */
					function toNamespace(regexp) {
						return regexp
							.toString()
							.substring(2, regexp.toString().length - 2)
							.replace(/\.\*\?$/, "*");
					}

					/**
					 * Coerce `val`.
					 *
					 * @param {Mixed} val
					 * @return {Mixed}
					 * @api private
					 */
					function coerce(val) {
						if (val instanceof Error) {
							return val.stack || val.message;
						}
						return val;
					}

					createDebug.enable(createDebug.load());

					return createDebug;
				}

				module.exports = setup;
			},
			{ ms: 21 },
		],
		18: [
			function (require, module, exports) {
				// originally pulled out of simple-peer

				module.exports = function getBrowserRTC() {
					if (typeof window === "undefined") return null;
					var wrtc = {
						RTCPeerConnection:
							window.RTCPeerConnection ||
							window.mozRTCPeerConnection ||
							window.webkitRTCPeerConnection,
						RTCSessionDescription:
							window.RTCSessionDescription ||
							window.mozRTCSessionDescription ||
							window.webkitRTCSessionDescription,
						RTCIceCandidate:
							window.RTCIceCandidate ||
							window.mozRTCIceCandidate ||
							window.webkitRTCIceCandidate,
					};
					if (!wrtc.RTCPeerConnection) return null;
					return wrtc;
				};
			},
			{},
		],
		19: [
			function (require, module, exports) {
				exports.read = function (buffer, offset, isLE, mLen, nBytes) {
					var e, m;
					var eLen = nBytes * 8 - mLen - 1;
					var eMax = (1 << eLen) - 1;
					var eBias = eMax >> 1;
					var nBits = -7;
					var i = isLE ? nBytes - 1 : 0;
					var d = isLE ? -1 : 1;
					var s = buffer[offset + i];

					i += d;

					e = s & ((1 << -nBits) - 1);
					s >>= -nBits;
					nBits += eLen;
					for (
						;
						nBits > 0;
						e = e * 256 + buffer[offset + i], i += d, nBits -= 8
					) {}

					m = e & ((1 << -nBits) - 1);
					e >>= -nBits;
					nBits += mLen;
					for (
						;
						nBits > 0;
						m = m * 256 + buffer[offset + i], i += d, nBits -= 8
					) {}

					if (e === 0) {
						e = 1 - eBias;
					} else if (e === eMax) {
						return m ? NaN : (s ? -1 : 1) * Infinity;
					} else {
						m = m + Math.pow(2, mLen);
						e = e - eBias;
					}
					return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
				};

				exports.write = function (
					buffer,
					value,
					offset,
					isLE,
					mLen,
					nBytes
				) {
					var e, m, c;
					var eLen = nBytes * 8 - mLen - 1;
					var eMax = (1 << eLen) - 1;
					var eBias = eMax >> 1;
					var rt =
						mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
					var i = isLE ? 0 : nBytes - 1;
					var d = isLE ? 1 : -1;
					var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

					value = Math.abs(value);

					if (isNaN(value) || value === Infinity) {
						m = isNaN(value) ? 1 : 0;
						e = eMax;
					} else {
						e = Math.floor(Math.log(value) / Math.LN2);
						if (value * (c = Math.pow(2, -e)) < 1) {
							e--;
							c *= 2;
						}
						if (e + eBias >= 1) {
							value += rt / c;
						} else {
							value += rt * Math.pow(2, 1 - eBias);
						}
						if (value * c >= 2) {
							e++;
							c /= 2;
						}

						if (e + eBias >= eMax) {
							m = 0;
							e = eMax;
						} else if (e + eBias >= 1) {
							m = (value * c - 1) * Math.pow(2, mLen);
							e = e + eBias;
						} else {
							m =
								value *
								Math.pow(2, eBias - 1) *
								Math.pow(2, mLen);
							e = 0;
						}
					}

					for (
						;
						mLen >= 8;
						buffer[offset + i] = m & 0xff,
							i += d,
							m /= 256,
							mLen -= 8
					) {}

					e = (e << mLen) | m;
					eLen += mLen;
					for (
						;
						eLen > 0;
						buffer[offset + i] = e & 0xff,
							i += d,
							e /= 256,
							eLen -= 8
					) {}

					buffer[offset + i - d] |= s * 128;
				};
			},
			{},
		],
		20: [
			function (require, module, exports) {
				if (typeof Object.create === "function") {
					// implementation from standard node.js 'util' module
					module.exports = function inherits(ctor, superCtor) {
						if (superCtor) {
							ctor.super_ = superCtor;
							ctor.prototype = Object.create(
								superCtor.prototype,
								{
									constructor: {
										value: ctor,
										enumerable: false,
										writable: true,
										configurable: true,
									},
								}
							);
						}
					};
				} else {
					// old school shim for old browsers
					module.exports = function inherits(ctor, superCtor) {
						if (superCtor) {
							ctor.super_ = superCtor;
							var TempCtor = function () {};
							TempCtor.prototype = superCtor.prototype;
							ctor.prototype = new TempCtor();
							ctor.prototype.constructor = ctor;
						}
					};
				}
			},
			{},
		],
		21: [
			function (require, module, exports) {
				/**
				 * Helpers.
				 */

				var s = 1000;
				var m = s * 60;
				var h = m * 60;
				var d = h * 24;
				var w = d * 7;
				var y = d * 365.25;

				/**
				 * Parse or format the given `val`.
				 *
				 * Options:
				 *
				 *  - `long` verbose formatting [false]
				 *
				 * @param {String|Number} val
				 * @param {Object} [options]
				 * @throws {Error} throw an error if val is not a non-empty string or a number
				 * @return {String|Number}
				 * @api public
				 */

				module.exports = function (val, options) {
					options = options || {};
					var type = typeof val;
					if (type === "string" && val.length > 0) {
						return parse(val);
					} else if (type === "number" && isFinite(val)) {
						return options.long ? fmtLong(val) : fmtShort(val);
					}
					throw new Error(
						"val is not a non-empty string or a valid number. val=" +
							JSON.stringify(val)
					);
				};

				/**
				 * Parse the given `str` and return milliseconds.
				 *
				 * @param {String} str
				 * @return {Number}
				 * @api private
				 */

				function parse(str) {
					str = String(str);
					if (str.length > 100) {
						return;
					}
					var match =
						/^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
							str
						);
					if (!match) {
						return;
					}
					var n = parseFloat(match[1]);
					var type = (match[2] || "ms").toLowerCase();
					switch (type) {
						case "years":
						case "year":
						case "yrs":
						case "yr":
						case "y":
							return n * y;
						case "weeks":
						case "week":
						case "w":
							return n * w;
						case "days":
						case "day":
						case "d":
							return n * d;
						case "hours":
						case "hour":
						case "hrs":
						case "hr":
						case "h":
							return n * h;
						case "minutes":
						case "minute":
						case "mins":
						case "min":
						case "m":
							return n * m;
						case "seconds":
						case "second":
						case "secs":
						case "sec":
						case "s":
							return n * s;
						case "milliseconds":
						case "millisecond":
						case "msecs":
						case "msec":
						case "ms":
							return n;
						default:
							return undefined;
					}
				}

				/**
				 * Short format for `ms`.
				 *
				 * @param {Number} ms
				 * @return {String}
				 * @api private
				 */

				function fmtShort(ms) {
					var msAbs = Math.abs(ms);
					if (msAbs >= d) {
						return Math.round(ms / d) + "d";
					}
					if (msAbs >= h) {
						return Math.round(ms / h) + "h";
					}
					if (msAbs >= m) {
						return Math.round(ms / m) + "m";
					}
					if (msAbs >= s) {
						return Math.round(ms / s) + "s";
					}
					return ms + "ms";
				}

				/**
				 * Long format for `ms`.
				 *
				 * @param {Number} ms
				 * @return {String}
				 * @api private
				 */

				function fmtLong(ms) {
					var msAbs = Math.abs(ms);
					if (msAbs >= d) {
						return plural(ms, msAbs, d, "day");
					}
					if (msAbs >= h) {
						return plural(ms, msAbs, h, "hour");
					}
					if (msAbs >= m) {
						return plural(ms, msAbs, m, "minute");
					}
					if (msAbs >= s) {
						return plural(ms, msAbs, s, "second");
					}
					return ms + " ms";
				}

				/**
				 * Pluralization helper.
				 */

				function plural(ms, msAbs, n, name) {
					var isPlural = msAbs >= n * 1.5;
					return (
						Math.round(ms / n) + " " + name + (isPlural ? "s" : "")
					);
				}
			},
			{},
		],
		22: [
			function (require, module, exports) {
				var wrappy = require("wrappy");
				module.exports = wrappy(once);
				module.exports.strict = wrappy(onceStrict);

				once.proto = once(function () {
					Object.defineProperty(Function.prototype, "once", {
						value: function () {
							return once(this);
						},
						configurable: true,
					});

					Object.defineProperty(Function.prototype, "onceStrict", {
						value: function () {
							return onceStrict(this);
						},
						configurable: true,
					});
				});

				function once(fn) {
					var f = function () {
						if (f.called) return f.value;
						f.called = true;
						return (f.value = fn.apply(this, arguments));
					};
					f.called = false;
					return f;
				}

				function onceStrict(fn) {
					var f = function () {
						if (f.called) throw new Error(f.onceError);
						f.called = true;
						return (f.value = fn.apply(this, arguments));
					};
					var name = fn.name || "Function wrapped with `once`";
					f.onceError = name + " shouldn't be called more than once";
					f.called = false;
					return f;
				}
			},
			{ wrappy: 49 },
		],
		23: [
			function (require, module, exports) {
				// shim for using process in browser
				var process = (module.exports = {});

				// cached from whatever global is present so that test runners that stub it
				// don't break things.  But we need to wrap it in a try catch in case it is
				// wrapped in strict mode code which doesn't define any globals.  It's inside a
				// function because try/catches deoptimize in certain engines.

				var cachedSetTimeout;
				var cachedClearTimeout;

				function defaultSetTimout() {
					throw new Error("setTimeout has not been defined");
				}
				function defaultClearTimeout() {
					throw new Error("clearTimeout has not been defined");
				}
				(function () {
					try {
						if (typeof setTimeout === "function") {
							cachedSetTimeout = setTimeout;
						} else {
							cachedSetTimeout = defaultSetTimout;
						}
					} catch (e) {
						cachedSetTimeout = defaultSetTimout;
					}
					try {
						if (typeof clearTimeout === "function") {
							cachedClearTimeout = clearTimeout;
						} else {
							cachedClearTimeout = defaultClearTimeout;
						}
					} catch (e) {
						cachedClearTimeout = defaultClearTimeout;
					}
				})();
				function runTimeout(fun) {
					if (cachedSetTimeout === setTimeout) {
						//normal enviroments in sane situations
						return setTimeout(fun, 0);
					}
					// if setTimeout wasn't available but was latter defined
					if (
						(cachedSetTimeout === defaultSetTimout ||
							!cachedSetTimeout) &&
						setTimeout
					) {
						cachedSetTimeout = setTimeout;
						return setTimeout(fun, 0);
					}
					try {
						// when when somebody has screwed with setTimeout but no I.E. maddness
						return cachedSetTimeout(fun, 0);
					} catch (e) {
						try {
							// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
							return cachedSetTimeout.call(null, fun, 0);
						} catch (e) {
							// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
							return cachedSetTimeout.call(this, fun, 0);
						}
					}
				}
				function runClearTimeout(marker) {
					if (cachedClearTimeout === clearTimeout) {
						//normal enviroments in sane situations
						return clearTimeout(marker);
					}
					// if clearTimeout wasn't available but was latter defined
					if (
						(cachedClearTimeout === defaultClearTimeout ||
							!cachedClearTimeout) &&
						clearTimeout
					) {
						cachedClearTimeout = clearTimeout;
						return clearTimeout(marker);
					}
					try {
						// when when somebody has screwed with setTimeout but no I.E. maddness
						return cachedClearTimeout(marker);
					} catch (e) {
						try {
							// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
							return cachedClearTimeout.call(null, marker);
						} catch (e) {
							// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
							// Some versions of I.E. have different rules for clearTimeout vs setTimeout
							return cachedClearTimeout.call(this, marker);
						}
					}
				}
				var queue = [];
				var draining = false;
				var currentQueue;
				var queueIndex = -1;

				function cleanUpNextTick() {
					if (!draining || !currentQueue) {
						return;
					}
					draining = false;
					if (currentQueue.length) {
						queue = currentQueue.concat(queue);
					} else {
						queueIndex = -1;
					}
					if (queue.length) {
						drainQueue();
					}
				}

				function drainQueue() {
					if (draining) {
						return;
					}
					var timeout = runTimeout(cleanUpNextTick);
					draining = true;

					var len = queue.length;
					while (len) {
						currentQueue = queue;
						queue = [];
						while (++queueIndex < len) {
							if (currentQueue) {
								currentQueue[queueIndex].run();
							}
						}
						queueIndex = -1;
						len = queue.length;
					}
					currentQueue = null;
					draining = false;
					runClearTimeout(timeout);
				}

				process.nextTick = function (fun) {
					var args = new Array(arguments.length - 1);
					if (arguments.length > 1) {
						for (var i = 1; i < arguments.length; i++) {
							args[i - 1] = arguments[i];
						}
					}
					queue.push(new Item(fun, args));
					if (queue.length === 1 && !draining) {
						runTimeout(drainQueue);
					}
				};

				// v8 likes predictible objects
				function Item(fun, array) {
					this.fun = fun;
					this.array = array;
				}
				Item.prototype.run = function () {
					this.fun.apply(null, this.array);
				};
				process.title = "browser";
				process.browser = true;
				process.env = {};
				process.argv = [];
				process.version = ""; // empty string to avoid regexp issues
				process.versions = {};

				function noop() {}

				process.on = noop;
				process.addListener = noop;
				process.once = noop;
				process.off = noop;
				process.removeListener = noop;
				process.removeAllListeners = noop;
				process.emit = noop;
				process.prependListener = noop;
				process.prependOnceListener = noop;

				process.listeners = function (name) {
					return [];
				};

				process.binding = function (name) {
					throw new Error("process.binding is not supported");
				};

				process.cwd = function () {
					return "/";
				};
				process.chdir = function (dir) {
					throw new Error("process.chdir is not supported");
				};
				process.umask = function () {
					return 0;
				};
			},
			{},
		],
		24: [
			function (require, module, exports) {
				(function (process, global) {
					"use strict";

					// limit of Crypto.getRandomValues()
					// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
					var MAX_BYTES = 65536;

					// Node supports requesting up to this number of bytes
					// https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
					var MAX_UINT32 = 4294967295;

					function oldBrowser() {
						throw new Error(
							"Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11"
						);
					}

					var Buffer = require("safe-buffer").Buffer;
					var crypto = global.crypto || global.msCrypto;

					if (crypto && crypto.getRandomValues) {
						module.exports = randomBytes;
					} else {
						module.exports = oldBrowser;
					}

					function randomBytes(size, cb) {
						// phantomjs needs to throw
						if (size > MAX_UINT32)
							throw new RangeError(
								"requested too many random bytes"
							);

						var bytes = Buffer.allocUnsafe(size);

						if (size > 0) {
							// getRandomValues fails on IE if size == 0
							if (size > MAX_BYTES) {
								// this is the max bytes crypto.getRandomValues
								// can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
								for (
									var generated = 0;
									generated < size;
									generated += MAX_BYTES
								) {
									// buffer.slice automatically checks if the end is past the end of
									// the buffer so we don't have to here
									crypto.getRandomValues(
										bytes.slice(
											generated,
											generated + MAX_BYTES
										)
									);
								}
							} else {
								crypto.getRandomValues(bytes);
							}
						}

						if (typeof cb === "function") {
							return process.nextTick(function () {
								cb(null, bytes);
							});
						}

						return bytes;
					}
				}).call(
					this,
					require("_process"),
					typeof global !== "undefined"
						? global
						: typeof self !== "undefined"
						? self
						: typeof window !== "undefined"
						? window
						: {}
				);
			},
			{ _process: 23, "safe-buffer": 41 },
		],
		25: [
			function (require, module, exports) {
				"use strict";

				function _inheritsLoose(subClass, superClass) {
					subClass.prototype = Object.create(superClass.prototype);
					subClass.prototype.constructor = subClass;
					subClass.__proto__ = superClass;
				}

				var codes = {};

				function createErrorType(code, message, Base) {
					if (!Base) {
						Base = Error;
					}

					function getMessage(arg1, arg2, arg3) {
						if (typeof message === "string") {
							return message;
						} else {
							return message(arg1, arg2, arg3);
						}
					}

					var NodeError =
						/*#__PURE__*/
						(function (_Base) {
							_inheritsLoose(NodeError, _Base);

							function NodeError(arg1, arg2, arg3) {
								return (
									_Base.call(
										this,
										getMessage(arg1, arg2, arg3)
									) || this
								);
							}

							return NodeError;
						})(Base);

					NodeError.prototype.name = Base.name;
					NodeError.prototype.code = code;
					codes[code] = NodeError;
				} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js

				function oneOf(expected, thing) {
					if (Array.isArray(expected)) {
						var len = expected.length;
						expected = expected.map(function (i) {
							return String(i);
						});

						if (len > 2) {
							return (
								"one of "
									.concat(thing, " ")
									.concat(
										expected.slice(0, len - 1).join(", "),
										", or "
									) + expected[len - 1]
							);
						} else if (len === 2) {
							return "one of "
								.concat(thing, " ")
								.concat(expected[0], " or ")
								.concat(expected[1]);
						} else {
							return "of ".concat(thing, " ").concat(expected[0]);
						}
					} else {
						return "of "
							.concat(thing, " ")
							.concat(String(expected));
					}
				} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith

				function startsWith(str, search, pos) {
					return (
						str.substr(
							!pos || pos < 0 ? 0 : +pos,
							search.length
						) === search
					);
				} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith

				function endsWith(str, search, this_len) {
					if (this_len === undefined || this_len > str.length) {
						this_len = str.length;
					}

					return (
						str.substring(this_len - search.length, this_len) ===
						search
					);
				} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes

				function includes(str, search, start) {
					if (typeof start !== "number") {
						start = 0;
					}

					if (start + search.length > str.length) {
						return false;
					} else {
						return str.indexOf(search, start) !== -1;
					}
				}

				createErrorType(
					"ERR_INVALID_OPT_VALUE",
					function (name, value) {
						return (
							'The value "' +
							value +
							'" is invalid for option "' +
							name +
							'"'
						);
					},
					TypeError
				);
				createErrorType(
					"ERR_INVALID_ARG_TYPE",
					function (name, expected, actual) {
						// determiner: 'must be' or 'must not be'
						var determiner;

						if (
							typeof expected === "string" &&
							startsWith(expected, "not ")
						) {
							determiner = "must not be";
							expected = expected.replace(/^not /, "");
						} else {
							determiner = "must be";
						}

						var msg;

						if (endsWith(name, " argument")) {
							// For cases like 'first argument'
							msg = "The "
								.concat(name, " ")
								.concat(determiner, " ")
								.concat(oneOf(expected, "type"));
						} else {
							var type = includes(name, ".")
								? "property"
								: "argument";
							msg = 'The "'
								.concat(name, '" ')
								.concat(type, " ")
								.concat(determiner, " ")
								.concat(oneOf(expected, "type"));
						}

						msg += ". Received type ".concat(typeof actual);
						return msg;
					},
					TypeError
				);
				createErrorType(
					"ERR_STREAM_PUSH_AFTER_EOF",
					"stream.push() after EOF"
				);
				createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function (name) {
					return "The " + name + " method is not implemented";
				});
				createErrorType(
					"ERR_STREAM_PREMATURE_CLOSE",
					"Premature close"
				);
				createErrorType("ERR_STREAM_DESTROYED", function (name) {
					return (
						"Cannot call " + name + " after a stream was destroyed"
					);
				});
				createErrorType(
					"ERR_MULTIPLE_CALLBACK",
					"Callback called multiple times"
				);
				createErrorType(
					"ERR_STREAM_CANNOT_PIPE",
					"Cannot pipe, not readable"
				);
				createErrorType(
					"ERR_STREAM_WRITE_AFTER_END",
					"write after end"
				);
				createErrorType(
					"ERR_STREAM_NULL_VALUES",
					"May not write null values to stream",
					TypeError
				);
				createErrorType(
					"ERR_UNKNOWN_ENCODING",
					function (arg) {
						return "Unknown encoding: " + arg;
					},
					TypeError
				);
				createErrorType(
					"ERR_STREAM_UNSHIFT_AFTER_END_EVENT",
					"stream.unshift() after end event"
				);
				module.exports.codes = codes;
			},
			{},
		],
		26: [
			function (require, module, exports) {
				(function (process) {
					"use strict";

					var experimentalWarnings = new Set();

					function emitExperimentalWarning(feature) {
						if (experimentalWarnings.has(feature)) return;
						var msg =
							feature +
							" is an experimental feature. This feature could " +
							"change at any time";
						experimentalWarnings.add(feature);
						process.emitWarning(msg, "ExperimentalWarning");
					}

					function noop() {}

					module.exports.emitExperimentalWarning = process.emitWarning
						? emitExperimentalWarning
						: noop;
				}).call(this, require("_process"));
			},
			{ _process: 23 },
		],
		27: [
			function (require, module, exports) {
				(function (process) {
					// Copyright Joyent, Inc. and other Node contributors.
					//
					// Permission is hereby granted, free of charge, to any person obtaining a
					// copy of this software and associated documentation files (the
					// "Software"), to deal in the Software without restriction, including
					// without limitation the rights to use, copy, modify, merge, publish,
					// distribute, sublicense, and/or sell copies of the Software, and to permit
					// persons to whom the Software is furnished to do so, subject to the
					// following conditions:
					//
					// The above copyright notice and this permission notice shall be included
					// in all copies or substantial portions of the Software.
					//
					// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
					// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
					// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
					// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
					// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
					// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
					// USE OR OTHER DEALINGS IN THE SOFTWARE.
					// a duplex stream is just a stream that is both readable and writable.
					// Since JS doesn't have multiple prototypal inheritance, this class
					// prototypally inherits from Readable, and then parasitically from
					// Writable.
					"use strict";
					/*<replacement>*/

					var objectKeys =
						Object.keys ||
						function (obj) {
							var keys = [];

							for (var key in obj) {
								keys.push(key);
							}

							return keys;
						};
					/*</replacement>*/

					module.exports = Duplex;

					var Readable = require("./_stream_readable");

					var Writable = require("./_stream_writable");

					require("inherits")(Duplex, Readable);

					{
						// Allow the keys array to be GC'ed.
						var keys = objectKeys(Writable.prototype);

						for (var v = 0; v < keys.length; v++) {
							var method = keys[v];
							if (!Duplex.prototype[method])
								Duplex.prototype[method] =
									Writable.prototype[method];
						}
					}

					function Duplex(options) {
						if (!(this instanceof Duplex))
							return new Duplex(options);
						Readable.call(this, options);
						Writable.call(this, options);
						this.allowHalfOpen = true;

						if (options) {
							if (options.readable === false)
								this.readable = false;
							if (options.writable === false)
								this.writable = false;

							if (options.allowHalfOpen === false) {
								this.allowHalfOpen = false;
								this.once("end", onend);
							}
						}
					}

					Object.defineProperty(
						Duplex.prototype,
						"writableHighWaterMark",
						{
							// making it explicit this property is not enumerable
							// because otherwise some prototype manipulation in
							// userland will fail
							enumerable: false,
							get: function get() {
								return this._writableState.highWaterMark;
							},
						}
					);
					Object.defineProperty(Duplex.prototype, "writableBuffer", {
						// making it explicit this property is not enumerable
						// because otherwise some prototype manipulation in
						// userland will fail
						enumerable: false,
						get: function get() {
							return (
								this._writableState &&
								this._writableState.getBuffer()
							);
						},
					});
					Object.defineProperty(Duplex.prototype, "writableLength", {
						// making it explicit this property is not enumerable
						// because otherwise some prototype manipulation in
						// userland will fail
						enumerable: false,
						get: function get() {
							return this._writableState.length;
						},
					}); // the no-half-open enforcer

					function onend() {
						// If the writable side ended, then we're ok.
						if (this._writableState.ended) return; // no more data can be written.
						// But allow more writes to happen in this tick.

						process.nextTick(onEndNT, this);
					}

					function onEndNT(self) {
						self.end();
					}

					Object.defineProperty(Duplex.prototype, "destroyed", {
						// making it explicit this property is not enumerable
						// because otherwise some prototype manipulation in
						// userland will fail
						enumerable: false,
						get: function get() {
							if (
								this._readableState === undefined ||
								this._writableState === undefined
							) {
								return false;
							}

							return (
								this._readableState.destroyed &&
								this._writableState.destroyed
							);
						},
						set: function set(value) {
							// we ignore the value if the stream
							// has not been initialized yet
							if (
								this._readableState === undefined ||
								this._writableState === undefined
							) {
								return;
							} // backward compatibility, the user is explicitly
							// managing destroyed

							this._readableState.destroyed = value;
							this._writableState.destroyed = value;
						},
					});
				}).call(this, require("_process"));
			},
			{
				"./_stream_readable": 29,
				"./_stream_writable": 31,
				_process: 23,
				inherits: 20,
			},
		],
		28: [
			function (require, module, exports) {
				// Copyright Joyent, Inc. and other Node contributors.
				//
				// Permission is hereby granted, free of charge, to any person obtaining a
				// copy of this software and associated documentation files (the
				// "Software"), to deal in the Software without restriction, including
				// without limitation the rights to use, copy, modify, merge, publish,
				// distribute, sublicense, and/or sell copies of the Software, and to permit
				// persons to whom the Software is furnished to do so, subject to the
				// following conditions:
				//
				// The above copyright notice and this permission notice shall be included
				// in all copies or substantial portions of the Software.
				//
				// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
				// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
				// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
				// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
				// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
				// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
				// USE OR OTHER DEALINGS IN THE SOFTWARE.
				// a passthrough stream.
				// basically just the most minimal sort of Transform stream.
				// Every written chunk gets output as-is.
				"use strict";

				module.exports = PassThrough;

				var Transform = require("./_stream_transform");

				require("inherits")(PassThrough, Transform);

				function PassThrough(options) {
					if (!(this instanceof PassThrough))
						return new PassThrough(options);
					Transform.call(this, options);
				}

				PassThrough.prototype._transform = function (
					chunk,
					encoding,
					cb
				) {
					cb(null, chunk);
				};
			},
			{ "./_stream_transform": 30, inherits: 20 },
		],
		29: [
			function (require, module, exports) {
				(function (process, global) {
					// Copyright Joyent, Inc. and other Node contributors.
					//
					// Permission is hereby granted, free of charge, to any person obtaining a
					// copy of this software and associated documentation files (the
					// "Software"), to deal in the Software without restriction, including
					// without limitation the rights to use, copy, modify, merge, publish,
					// distribute, sublicense, and/or sell copies of the Software, and to permit
					// persons to whom the Software is furnished to do so, subject to the
					// following conditions:
					//
					// The above copyright notice and this permission notice shall be included
					// in all copies or substantial portions of the Software.
					//
					// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
					// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
					// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
					// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
					// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
					// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
					// USE OR OTHER DEALINGS IN THE SOFTWARE.
					"use strict";

					module.exports = Readable;
					/*<replacement>*/

					var Duplex;
					/*</replacement>*/

					Readable.ReadableState = ReadableState;
					/*<replacement>*/

					var EE = require("events").EventEmitter;

					var EElistenerCount = function EElistenerCount(
						emitter,
						type
					) {
						return emitter.listeners(type).length;
					};
					/*</replacement>*/

					/*<replacement>*/

					var Stream = require("./internal/streams/stream");
					/*</replacement>*/

					var Buffer = require("buffer").Buffer;

					var OurUint8Array = global.Uint8Array || function () {};

					function _uint8ArrayToBuffer(chunk) {
						return Buffer.from(chunk);
					}

					function _isUint8Array(obj) {
						return (
							Buffer.isBuffer(obj) || obj instanceof OurUint8Array
						);
					}
					/*<replacement>*/

					var debugUtil = require("util");

					var debug;

					if (debugUtil && debugUtil.debuglog) {
						debug = debugUtil.debuglog("stream");
					} else {
						debug = function debug() {};
					}
					/*</replacement>*/

					var BufferList = require("./internal/streams/buffer_list");

					var destroyImpl = require("./internal/streams/destroy");

					var _require = require("./internal/streams/state"),
						getHighWaterMark = _require.getHighWaterMark;

					var _require$codes = require("../errors").codes,
						ERR_INVALID_ARG_TYPE =
							_require$codes.ERR_INVALID_ARG_TYPE,
						ERR_STREAM_PUSH_AFTER_EOF =
							_require$codes.ERR_STREAM_PUSH_AFTER_EOF,
						ERR_METHOD_NOT_IMPLEMENTED =
							_require$codes.ERR_METHOD_NOT_IMPLEMENTED,
						ERR_STREAM_UNSHIFT_AFTER_END_EVENT =
							_require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;

					var _require2 = require("../experimentalWarning"),
						emitExperimentalWarning =
							_require2.emitExperimentalWarning; // Lazy loaded to improve the startup performance.

					var StringDecoder;
					var createReadableStreamAsyncIterator;

					require("inherits")(Readable, Stream);

					var kProxyEvents = [
						"error",
						"close",
						"destroy",
						"pause",
						"resume",
					];

					function prependListener(emitter, event, fn) {
						// Sadly this is not cacheable as some libraries bundle their own
						// event emitter implementation with them.
						if (typeof emitter.prependListener === "function")
							return emitter.prependListener(event, fn); // This is a hack to make sure that our error handler is attached before any
						// userland ones.  NEVER DO THIS. This is here only because this code needs
						// to continue to work with older versions of Node.js that do not include
						// the prependListener() method. The goal is to eventually remove this hack.

						if (!emitter._events || !emitter._events[event])
							emitter.on(event, fn);
						else if (Array.isArray(emitter._events[event]))
							emitter._events[event].unshift(fn);
						else
							emitter._events[event] = [
								fn,
								emitter._events[event],
							];
					}

					function ReadableState(options, stream, isDuplex) {
						Duplex = Duplex || require("./_stream_duplex");
						options = options || {}; // Duplex streams are both readable and writable, but share
						// the same options object.
						// However, some cases require setting options to different
						// values for the readable and the writable sides of the duplex stream.
						// These options can be provided separately as readableXXX and writableXXX.

						if (typeof isDuplex !== "boolean")
							isDuplex = stream instanceof Duplex; // object stream flag. Used to make read(n) ignore n and to
						// make all the buffer merging and length checks go away

						this.objectMode = !!options.objectMode;
						if (isDuplex)
							this.objectMode =
								this.objectMode || !!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
						// Note: 0 is a valid value, means "don't call _read preemptively ever"

						this.highWaterMark = getHighWaterMark(
							this,
							options,
							"readableHighWaterMark",
							isDuplex
						); // A linked list is used to store data chunks instead of an array because the
						// linked list can remove elements from the beginning faster than
						// array.shift()

						this.buffer = new BufferList();
						this.length = 0;
						this.pipes = null;
						this.pipesCount = 0;
						this.flowing = null;
						this.ended = false;
						this.endEmitted = false;
						this.reading = false; // a flag to be able to tell if the event 'readable'/'data' is emitted
						// immediately, or on a later tick.  We set this to true at first, because
						// any actions that shouldn't happen until "later" should generally also
						// not happen before the first read call.

						this.sync = true; // whenever we return null, then we set a flag to say
						// that we're awaiting a 'readable' event emission.

						this.needReadable = false;
						this.emittedReadable = false;
						this.readableListening = false;
						this.resumeScheduled = false;
						this.paused = true; // Should close be emitted on destroy. Defaults to true.

						this.emitClose = options.emitClose !== false; // has it been destroyed

						this.destroyed = false; // Crypto is kind of old and crusty.  Historically, its default string
						// encoding is 'binary' so we have to make this configurable.
						// Everything else in the universe uses 'utf8', though.

						this.defaultEncoding =
							options.defaultEncoding || "utf8"; // the number of writers that are awaiting a drain event in .pipe()s

						this.awaitDrain = 0; // if true, a maybeReadMore has been scheduled

						this.readingMore = false;
						this.decoder = null;
						this.encoding = null;

						if (options.encoding) {
							if (!StringDecoder)
								StringDecoder =
									require("string_decoder/").StringDecoder;
							this.decoder = new StringDecoder(options.encoding);
							this.encoding = options.encoding;
						}
					}

					function Readable(options) {
						Duplex = Duplex || require("./_stream_duplex");
						if (!(this instanceof Readable))
							return new Readable(options); // Checking for a Stream.Duplex instance is faster here instead of inside
						// the ReadableState constructor, at least with V8 6.5

						var isDuplex = this instanceof Duplex;
						this._readableState = new ReadableState(
							options,
							this,
							isDuplex
						); // legacy

						this.readable = true;

						if (options) {
							if (typeof options.read === "function")
								this._read = options.read;
							if (typeof options.destroy === "function")
								this._destroy = options.destroy;
						}

						Stream.call(this);
					}

					Object.defineProperty(Readable.prototype, "destroyed", {
						// making it explicit this property is not enumerable
						// because otherwise some prototype manipulation in
						// userland will fail
						enumerable: false,
						get: function get() {
							if (this._readableState === undefined) {
								return false;
							}

							return this._readableState.destroyed;
						},
						set: function set(value) {
							// we ignore the value if the stream
							// has not been initialized yet
							if (!this._readableState) {
								return;
							} // backward compatibility, the user is explicitly
							// managing destroyed

							this._readableState.destroyed = value;
						},
					});
					Readable.prototype.destroy = destroyImpl.destroy;
					Readable.prototype._undestroy = destroyImpl.undestroy;

					Readable.prototype._destroy = function (err, cb) {
						cb(err);
					}; // Manually shove something into the read() buffer.
					// This returns true if the highWaterMark has not been hit yet,
					// similar to how Writable.write() returns true if you should
					// write() some more.

					Readable.prototype.push = function (chunk, encoding) {
						var state = this._readableState;
						var skipChunkCheck;

						if (!state.objectMode) {
							if (typeof chunk === "string") {
								encoding = encoding || state.defaultEncoding;

								if (encoding !== state.encoding) {
									chunk = Buffer.from(chunk, encoding);
									encoding = "";
								}

								skipChunkCheck = true;
							}
						} else {
							skipChunkCheck = true;
						}

						return readableAddChunk(
							this,
							chunk,
							encoding,
							false,
							skipChunkCheck
						);
					}; // Unshift should *always* be something directly out of read()

					Readable.prototype.unshift = function (chunk) {
						return readableAddChunk(this, chunk, null, true, false);
					};

					function readableAddChunk(
						stream,
						chunk,
						encoding,
						addToFront,
						skipChunkCheck
					) {
						debug("readableAddChunk", chunk);
						var state = stream._readableState;

						if (chunk === null) {
							state.reading = false;
							onEofChunk(stream, state);
						} else {
							var er;
							if (!skipChunkCheck)
								er = chunkInvalid(state, chunk);

							if (er) {
								stream.emit("error", er);
							} else if (
								state.objectMode ||
								(chunk && chunk.length > 0)
							) {
								if (
									typeof chunk !== "string" &&
									!state.objectMode &&
									Object.getPrototypeOf(chunk) !==
										Buffer.prototype
								) {
									chunk = _uint8ArrayToBuffer(chunk);
								}

								if (addToFront) {
									if (state.endEmitted)
										stream.emit(
											"error",
											new ERR_STREAM_UNSHIFT_AFTER_END_EVENT()
										);
									else addChunk(stream, state, chunk, true);
								} else if (state.ended) {
									stream.emit(
										"error",
										new ERR_STREAM_PUSH_AFTER_EOF()
									);
								} else if (state.destroyed) {
									return false;
								} else {
									state.reading = false;

									if (state.decoder && !encoding) {
										chunk = state.decoder.write(chunk);
										if (
											state.objectMode ||
											chunk.length !== 0
										)
											addChunk(
												stream,
												state,
												chunk,
												false
											);
										else maybeReadMore(stream, state);
									} else {
										addChunk(stream, state, chunk, false);
									}
								}
							} else if (!addToFront) {
								state.reading = false;
								maybeReadMore(stream, state);
							}
						} // We can push more data if we are below the highWaterMark.
						// Also, if we have no data yet, we can stand some more bytes.
						// This is to work around cases where hwm=0, such as the repl.

						return (
							!state.ended &&
							(state.length < state.highWaterMark ||
								state.length === 0)
						);
					}

					function addChunk(stream, state, chunk, addToFront) {
						if (
							state.flowing &&
							state.length === 0 &&
							!state.sync
						) {
							state.awaitDrain = 0;
							stream.emit("data", chunk);
						} else {
							// update the buffer info.
							state.length += state.objectMode ? 1 : chunk.length;
							if (addToFront) state.buffer.unshift(chunk);
							else state.buffer.push(chunk);
							if (state.needReadable) emitReadable(stream);
						}

						maybeReadMore(stream, state);
					}

					function chunkInvalid(state, chunk) {
						var er;

						if (
							!_isUint8Array(chunk) &&
							typeof chunk !== "string" &&
							chunk !== undefined &&
							!state.objectMode
						) {
							er = new ERR_INVALID_ARG_TYPE(
								"chunk",
								["string", "Buffer", "Uint8Array"],
								chunk
							);
						}

						return er;
					}

					Readable.prototype.isPaused = function () {
						return this._readableState.flowing === false;
					}; // backwards compatibility.

					Readable.prototype.setEncoding = function (enc) {
						if (!StringDecoder)
							StringDecoder =
								require("string_decoder/").StringDecoder;
						this._readableState.decoder = new StringDecoder(enc); // if setEncoding(null), decoder.encoding equals utf8

						this._readableState.encoding =
							this._readableState.decoder.encoding;
						return this;
					}; // Don't raise the hwm > 8MB

					var MAX_HWM = 0x800000;

					function computeNewHighWaterMark(n) {
						if (n >= MAX_HWM) {
							n = MAX_HWM;
						} else {
							// Get the next highest power of 2 to prevent increasing hwm excessively in
							// tiny amounts
							n--;
							n |= n >>> 1;
							n |= n >>> 2;
							n |= n >>> 4;
							n |= n >>> 8;
							n |= n >>> 16;
							n++;
						}

						return n;
					} // This function is designed to be inlinable, so please take care when making
					// changes to the function body.

					function howMuchToRead(n, state) {
						if (n <= 0 || (state.length === 0 && state.ended))
							return 0;
						if (state.objectMode) return 1;

						if (n !== n) {
							// Only flow one buffer at a time
							if (state.flowing && state.length)
								return state.buffer.head.data.length;
							else return state.length;
						} // If we're asking for more than the current hwm, then raise the hwm.

						if (n > state.highWaterMark)
							state.highWaterMark = computeNewHighWaterMark(n);
						if (n <= state.length) return n; // Don't have enough

						if (!state.ended) {
							state.needReadable = true;
							return 0;
						}

						return state.length;
					} // you can override either this method, or the async _read(n) below.

					Readable.prototype.read = function (n) {
						debug("read", n);
						n = parseInt(n, 10);
						var state = this._readableState;
						var nOrig = n;
						if (n !== 0) state.emittedReadable = false; // if we're doing read(0) to trigger a readable event, but we
						// already have a bunch of data in the buffer, then just trigger
						// the 'readable' event and move on.

						if (
							n === 0 &&
							state.needReadable &&
							((state.highWaterMark !== 0
								? state.length >= state.highWaterMark
								: state.length > 0) ||
								state.ended)
						) {
							debug(
								"read: emitReadable",
								state.length,
								state.ended
							);
							if (state.length === 0 && state.ended)
								endReadable(this);
							else emitReadable(this);
							return null;
						}

						n = howMuchToRead(n, state); // if we've ended, and we're now clear, then finish it up.

						if (n === 0 && state.ended) {
							if (state.length === 0) endReadable(this);
							return null;
						} // All the actual chunk generation logic needs to be
						// *below* the call to _read.  The reason is that in certain
						// synthetic stream cases, such as passthrough streams, _read
						// may be a completely synchronous operation which may change
						// the state of the read buffer, providing enough data when
						// before there was *not* enough.
						//
						// So, the steps are:
						// 1. Figure out what the state of things will be after we do
						// a read from the buffer.
						//
						// 2. If that resulting state will trigger a _read, then call _read.
						// Note that this may be asynchronous, or synchronous.  Yes, it is
						// deeply ugly to write APIs this way, but that still doesn't mean
						// that the Readable class should behave improperly, as streams are
						// designed to be sync/async agnostic.
						// Take note if the _read call is sync or async (ie, if the read call
						// has returned yet), so that we know whether or not it's safe to emit
						// 'readable' etc.
						//
						// 3. Actually pull the requested chunks out of the buffer and return.
						// if we need a readable event, then we need to do some reading.

						var doRead = state.needReadable;
						debug("need readable", doRead); // if we currently have less than the highWaterMark, then also read some

						if (
							state.length === 0 ||
							state.length - n < state.highWaterMark
						) {
							doRead = true;
							debug("length less than watermark", doRead);
						} // however, if we've ended, then there's no point, and if we're already
						// reading, then it's unnecessary.

						if (state.ended || state.reading) {
							doRead = false;
							debug("reading or ended", doRead);
						} else if (doRead) {
							debug("do read");
							state.reading = true;
							state.sync = true; // if the length is currently zero, then we *need* a readable event.

							if (state.length === 0) state.needReadable = true; // call internal read method

							this._read(state.highWaterMark);

							state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
							// and we need to re-evaluate how much data we can return to the user.

							if (!state.reading) n = howMuchToRead(nOrig, state);
						}

						var ret;
						if (n > 0) ret = fromList(n, state);
						else ret = null;

						if (ret === null) {
							state.needReadable = true;
							n = 0;
						} else {
							state.length -= n;
							state.awaitDrain = 0;
						}

						if (state.length === 0) {
							// If we have nothing in the buffer, then we want to know
							// as soon as we *do* get something into the buffer.
							if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

							if (nOrig !== n && state.ended) endReadable(this);
						}

						if (ret !== null) this.emit("data", ret);
						return ret;
					};

					function onEofChunk(stream, state) {
						if (state.ended) return;

						if (state.decoder) {
							var chunk = state.decoder.end();

							if (chunk && chunk.length) {
								state.buffer.push(chunk);
								state.length += state.objectMode
									? 1
									: chunk.length;
							}
						}

						state.ended = true;

						if (state.sync) {
							// if we are sync, wait until next tick to emit the data.
							// Otherwise we risk emitting data in the flow()
							// the readable code triggers during a read() call
							emitReadable(stream);
						} else {
							// emit 'readable' now to make sure it gets picked up.
							state.needReadable = false;

							if (!state.emittedReadable) {
								state.emittedReadable = true;
								emitReadable_(stream);
							}
						}
					} // Don't emit readable right away in sync mode, because this can trigger
					// another read() call => stack overflow.  This way, it might trigger
					// a nextTick recursion warning, but that's not so bad.

					function emitReadable(stream) {
						var state = stream._readableState;
						state.needReadable = false;

						if (!state.emittedReadable) {
							debug("emitReadable", state.flowing);
							state.emittedReadable = true;
							process.nextTick(emitReadable_, stream);
						}
					}

					function emitReadable_(stream) {
						var state = stream._readableState;
						debug(
							"emitReadable_",
							state.destroyed,
							state.length,
							state.ended
						);

						if (!state.destroyed && (state.length || state.ended)) {
							stream.emit("readable");
						} // The stream needs another readable event if
						// 1. It is not flowing, as the flow mechanism will take
						//    care of it.
						// 2. It is not ended.
						// 3. It is below the highWaterMark, so we can schedule
						//    another readable later.

						state.needReadable =
							!state.flowing &&
							!state.ended &&
							state.length <= state.highWaterMark;
						flow(stream);
					} // at this point, the user has presumably seen the 'readable' event,
					// and called read() to consume some data.  that may have triggered
					// in turn another _read(n) call, in which case reading = true if
					// it's in progress.
					// However, if we're not ended, or reading, and the length < hwm,
					// then go ahead and try to read some more preemptively.

					function maybeReadMore(stream, state) {
						if (!state.readingMore) {
							state.readingMore = true;
							process.nextTick(maybeReadMore_, stream, state);
						}
					}

					function maybeReadMore_(stream, state) {
						// Attempt to read more data if we should.
						//
						// The conditions for reading more data are (one of):
						// - Not enough data buffered (state.length < state.highWaterMark). The loop
						//   is responsible for filling the buffer with enough data if such data
						//   is available. If highWaterMark is 0 and we are not in the flowing mode
						//   we should _not_ attempt to buffer any extra data. We'll get more data
						//   when the stream consumer calls read() instead.
						// - No data in the buffer, and the stream is in flowing mode. In this mode
						//   the loop below is responsible for ensuring read() is called. Failing to
						//   call read here would abort the flow and there's no other mechanism for
						//   continuing the flow if the stream consumer has just subscribed to the
						//   'data' event.
						//
						// In addition to the above conditions to keep reading data, the following
						// conditions prevent the data from being read:
						// - The stream has ended (state.ended).
						// - There is already a pending 'read' operation (state.reading). This is a
						//   case where the the stream has called the implementation defined _read()
						//   method, but they are processing the call asynchronously and have _not_
						//   called push() with new data. In this case we skip performing more
						//   read()s. The execution ends in this method again after the _read() ends
						//   up calling push() with more data.
						while (
							!state.reading &&
							!state.ended &&
							(state.length < state.highWaterMark ||
								(state.flowing && state.length === 0))
						) {
							var len = state.length;
							debug("maybeReadMore read 0");
							stream.read(0);
							if (len === state.length)
								// didn't get any data, stop spinning.
								break;
						}

						state.readingMore = false;
					} // abstract method.  to be overridden in specific implementation classes.
					// call cb(er, data) where data is <= n in length.
					// for virtual (non-string, non-buffer) streams, "length" is somewhat
					// arbitrary, and perhaps not very meaningful.

					Readable.prototype._read = function (n) {
						this.emit(
							"error",
							new ERR_METHOD_NOT_IMPLEMENTED("_read()")
						);
					};

					Readable.prototype.pipe = function (dest, pipeOpts) {
						var src = this;
						var state = this._readableState;

						switch (state.pipesCount) {
							case 0:
								state.pipes = dest;
								break;

							case 1:
								state.pipes = [state.pipes, dest];
								break;

							default:
								state.pipes.push(dest);
								break;
						}

						state.pipesCount += 1;
						debug(
							"pipe count=%d opts=%j",
							state.pipesCount,
							pipeOpts
						);
						var doEnd =
							(!pipeOpts || pipeOpts.end !== false) &&
							dest !== process.stdout &&
							dest !== process.stderr;
						var endFn = doEnd ? onend : unpipe;
						if (state.endEmitted) process.nextTick(endFn);
						else src.once("end", endFn);
						dest.on("unpipe", onunpipe);

						function onunpipe(readable, unpipeInfo) {
							debug("onunpipe");

							if (readable === src) {
								if (
									unpipeInfo &&
									unpipeInfo.hasUnpiped === false
								) {
									unpipeInfo.hasUnpiped = true;
									cleanup();
								}
							}
						}

						function onend() {
							debug("onend");
							dest.end();
						} // when the dest drains, it reduces the awaitDrain counter
						// on the source.  This would be more elegant with a .once()
						// handler in flow(), but adding and removing repeatedly is
						// too slow.

						var ondrain = pipeOnDrain(src);
						dest.on("drain", ondrain);
						var cleanedUp = false;

						function cleanup() {
							debug("cleanup"); // cleanup event handlers once the pipe is broken

							dest.removeListener("close", onclose);
							dest.removeListener("finish", onfinish);
							dest.removeListener("drain", ondrain);
							dest.removeListener("error", onerror);
							dest.removeListener("unpipe", onunpipe);
							src.removeListener("end", onend);
							src.removeListener("end", unpipe);
							src.removeListener("data", ondata);
							cleanedUp = true; // if the reader is waiting for a drain event from this
							// specific writer, then it would cause it to never start
							// flowing again.
							// So, if this is awaiting a drain, then we just call it now.
							// If we don't know, then assume that we are waiting for one.

							if (
								state.awaitDrain &&
								(!dest._writableState ||
									dest._writableState.needDrain)
							)
								ondrain();
						}

						src.on("data", ondata);

						function ondata(chunk) {
							debug("ondata");
							var ret = dest.write(chunk);
							debug("dest.write", ret);

							if (ret === false) {
								// If the user unpiped during `dest.write()`, it is possible
								// to get stuck in a permanently paused state if that write
								// also returned false.
								// => Check whether `dest` is still a piping destination.
								if (
									((state.pipesCount === 1 &&
										state.pipes === dest) ||
										(state.pipesCount > 1 &&
											indexOf(state.pipes, dest) !==
												-1)) &&
									!cleanedUp
								) {
									debug(
										"false write response, pause",
										state.awaitDrain
									);
									state.awaitDrain++;
								}

								src.pause();
							}
						} // if the dest has an error, then stop piping into it.
						// however, don't suppress the throwing behavior for this.

						function onerror(er) {
							debug("onerror", er);
							unpipe();
							dest.removeListener("error", onerror);
							if (EElistenerCount(dest, "error") === 0)
								dest.emit("error", er);
						} // Make sure our error handler is attached before userland ones.

						prependListener(dest, "error", onerror); // Both close and finish should trigger unpipe, but only once.

						function onclose() {
							dest.removeListener("finish", onfinish);
							unpipe();
						}

						dest.once("close", onclose);

						function onfinish() {
							debug("onfinish");
							dest.removeListener("close", onclose);
							unpipe();
						}

						dest.once("finish", onfinish);

						function unpipe() {
							debug("unpipe");
							src.unpipe(dest);
						} // tell the dest that it's being piped to

						dest.emit("pipe", src); // start the flow if it hasn't been started already.

						if (!state.flowing) {
							debug("pipe resume");
							src.resume();
						}

						return dest;
					};

					function pipeOnDrain(src) {
						return function pipeOnDrainFunctionResult() {
							var state = src._readableState;
							debug("pipeOnDrain", state.awaitDrain);
							if (state.awaitDrain) state.awaitDrain--;

							if (
								state.awaitDrain === 0 &&
								EElistenerCount(src, "data")
							) {
								state.flowing = true;
								flow(src);
							}
						};
					}

					Readable.prototype.unpipe = function (dest) {
						var state = this._readableState;
						var unpipeInfo = {
							hasUnpiped: false,
						}; // if we're not piping anywhere, then do nothing.

						if (state.pipesCount === 0) return this; // just one destination.  most common case.

						if (state.pipesCount === 1) {
							// passed in one, but it's not the right one.
							if (dest && dest !== state.pipes) return this;
							if (!dest) dest = state.pipes; // got a match.

							state.pipes = null;
							state.pipesCount = 0;
							state.flowing = false;
							if (dest) dest.emit("unpipe", this, unpipeInfo);
							return this;
						} // slow case. multiple pipe destinations.

						if (!dest) {
							// remove all.
							var dests = state.pipes;
							var len = state.pipesCount;
							state.pipes = null;
							state.pipesCount = 0;
							state.flowing = false;

							for (var i = 0; i < len; i++) {
								dests[i].emit("unpipe", this, {
									hasUnpiped: false,
								});
							}

							return this;
						} // try to find the right one.

						var index = indexOf(state.pipes, dest);
						if (index === -1) return this;
						state.pipes.splice(index, 1);
						state.pipesCount -= 1;
						if (state.pipesCount === 1)
							state.pipes = state.pipes[0];
						dest.emit("unpipe", this, unpipeInfo);
						return this;
					}; // set up data events if they are asked for
					// Ensure readable listeners eventually get something

					Readable.prototype.on = function (ev, fn) {
						var res = Stream.prototype.on.call(this, ev, fn);
						var state = this._readableState;

						if (ev === "data") {
							// update readableListening so that resume() may be a no-op
							// a few lines down. This is needed to support once('readable').
							state.readableListening =
								this.listenerCount("readable") > 0; // Try start flowing on next tick if stream isn't explicitly paused

							if (state.flowing !== false) this.resume();
						} else if (ev === "readable") {
							if (!state.endEmitted && !state.readableListening) {
								state.readableListening =
									state.needReadable = true;
								state.flowing = false;
								state.emittedReadable = false;
								debug(
									"on readable",
									state.length,
									state.reading
								);

								if (state.length) {
									emitReadable(this);
								} else if (!state.reading) {
									process.nextTick(nReadingNextTick, this);
								}
							}
						}

						return res;
					};

					Readable.prototype.addListener = Readable.prototype.on;

					Readable.prototype.removeListener = function (ev, fn) {
						var res = Stream.prototype.removeListener.call(
							this,
							ev,
							fn
						);

						if (ev === "readable") {
							// We need to check if there is someone still listening to
							// readable and reset the state. However this needs to happen
							// after readable has been emitted but before I/O (nextTick) to
							// support once('readable', fn) cycles. This means that calling
							// resume within the same tick will have no
							// effect.
							process.nextTick(updateReadableListening, this);
						}

						return res;
					};

					Readable.prototype.removeAllListeners = function (ev) {
						var res = Stream.prototype.removeAllListeners.apply(
							this,
							arguments
						);

						if (ev === "readable" || ev === undefined) {
							// We need to check if there is someone still listening to
							// readable and reset the state. However this needs to happen
							// after readable has been emitted but before I/O (nextTick) to
							// support once('readable', fn) cycles. This means that calling
							// resume within the same tick will have no
							// effect.
							process.nextTick(updateReadableListening, this);
						}

						return res;
					};

					function updateReadableListening(self) {
						var state = self._readableState;
						state.readableListening =
							self.listenerCount("readable") > 0;

						if (state.resumeScheduled && !state.paused) {
							// flowing needs to be set to true now, otherwise
							// the upcoming resume will not flow.
							state.flowing = true; // crude way to check if we should resume
						} else if (self.listenerCount("data") > 0) {
							self.resume();
						}
					}

					function nReadingNextTick(self) {
						debug("readable nexttick read 0");
						self.read(0);
					} // pause() and resume() are remnants of the legacy readable stream API
					// If the user uses them, then switch into old mode.

					Readable.prototype.resume = function () {
						var state = this._readableState;

						if (!state.flowing) {
							debug("resume"); // we flow only if there is no one listening
							// for readable, but we still have to call
							// resume()

							state.flowing = !state.readableListening;
							resume(this, state);
						}

						state.paused = false;
						return this;
					};

					function resume(stream, state) {
						if (!state.resumeScheduled) {
							state.resumeScheduled = true;
							process.nextTick(resume_, stream, state);
						}
					}

					function resume_(stream, state) {
						debug("resume", state.reading);

						if (!state.reading) {
							stream.read(0);
						}

						state.resumeScheduled = false;
						stream.emit("resume");
						flow(stream);
						if (state.flowing && !state.reading) stream.read(0);
					}

					Readable.prototype.pause = function () {
						debug(
							"call pause flowing=%j",
							this._readableState.flowing
						);

						if (this._readableState.flowing !== false) {
							debug("pause");
							this._readableState.flowing = false;
							this.emit("pause");
						}

						this._readableState.paused = true;
						return this;
					};

					function flow(stream) {
						var state = stream._readableState;
						debug("flow", state.flowing);

						while (state.flowing && stream.read() !== null) {}
					} // wrap an old-style stream as the async data source.
					// This is *not* part of the readable stream interface.
					// It is an ugly unfortunate mess of history.

					Readable.prototype.wrap = function (stream) {
						var _this = this;

						var state = this._readableState;
						var paused = false;
						stream.on("end", function () {
							debug("wrapped end");

							if (state.decoder && !state.ended) {
								var chunk = state.decoder.end();
								if (chunk && chunk.length) _this.push(chunk);
							}

							_this.push(null);
						});
						stream.on("data", function (chunk) {
							debug("wrapped data");
							if (state.decoder)
								chunk = state.decoder.write(chunk); // don't skip over falsy values in objectMode

							if (
								state.objectMode &&
								(chunk === null || chunk === undefined)
							)
								return;
							else if (
								!state.objectMode &&
								(!chunk || !chunk.length)
							)
								return;

							var ret = _this.push(chunk);

							if (!ret) {
								paused = true;
								stream.pause();
							}
						}); // proxy all the other methods.
						// important when wrapping filters and duplexes.

						for (var i in stream) {
							if (
								this[i] === undefined &&
								typeof stream[i] === "function"
							) {
								this[i] = (function methodWrap(method) {
									return function methodWrapReturnFunction() {
										return stream[method].apply(
											stream,
											arguments
										);
									};
								})(i);
							}
						} // proxy certain important events.

						for (var n = 0; n < kProxyEvents.length; n++) {
							stream.on(
								kProxyEvents[n],
								this.emit.bind(this, kProxyEvents[n])
							);
						} // when we try to consume some more bytes, simply unpause the
						// underlying stream.

						this._read = function (n) {
							debug("wrapped _read", n);

							if (paused) {
								paused = false;
								stream.resume();
							}
						};

						return this;
					};

					if (typeof Symbol === "function") {
						Readable.prototype[Symbol.asyncIterator] = function () {
							emitExperimentalWarning(
								"Readable[Symbol.asyncIterator]"
							);

							if (
								createReadableStreamAsyncIterator === undefined
							) {
								createReadableStreamAsyncIterator = require("./internal/streams/async_iterator");
							}

							return createReadableStreamAsyncIterator(this);
						};
					}

					Object.defineProperty(
						Readable.prototype,
						"readableHighWaterMark",
						{
							// making it explicit this property is not enumerable
							// because otherwise some prototype manipulation in
							// userland will fail
							enumerable: false,
							get: function get() {
								return this._readableState.highWaterMark;
							},
						}
					);
					Object.defineProperty(
						Readable.prototype,
						"readableBuffer",
						{
							// making it explicit this property is not enumerable
							// because otherwise some prototype manipulation in
							// userland will fail
							enumerable: false,
							get: function get() {
								return (
									this._readableState &&
									this._readableState.buffer
								);
							},
						}
					);
					Object.defineProperty(
						Readable.prototype,
						"readableFlowing",
						{
							// making it explicit this property is not enumerable
							// because otherwise some prototype manipulation in
							// userland will fail
							enumerable: false,
							get: function get() {
								return this._readableState.flowing;
							},
							set: function set(state) {
								if (this._readableState) {
									this._readableState.flowing = state;
								}
							},
						}
					); // exposed for testing purposes only.

					Readable._fromList = fromList;
					Object.defineProperty(
						Readable.prototype,
						"readableLength",
						{
							// making it explicit this property is not enumerable
							// because otherwise some prototype manipulation in
							// userland will fail
							enumerable: false,
							get: function get() {
								return this._readableState.length;
							},
						}
					); // Pluck off n bytes from an array of buffers.
					// Length is the combined lengths of all the buffers in the list.
					// This function is designed to be inlinable, so please take care when making
					// changes to the function body.

					function fromList(n, state) {
						// nothing buffered
						if (state.length === 0) return null;
						var ret;
						if (state.objectMode) ret = state.buffer.shift();
						else if (!n || n >= state.length) {
							// read it all, truncate the list
							if (state.decoder) ret = state.buffer.join("");
							else if (state.buffer.length === 1)
								ret = state.buffer.first();
							else ret = state.buffer.concat(state.length);
							state.buffer.clear();
						} else {
							// read part of list
							ret = state.buffer.consume(n, state.decoder);
						}
						return ret;
					}

					function endReadable(stream) {
						var state = stream._readableState;
						debug("endReadable", state.endEmitted);

						if (!state.endEmitted) {
							state.ended = true;
							process.nextTick(endReadableNT, state, stream);
						}
					}

					function endReadableNT(state, stream) {
						debug("endReadableNT", state.endEmitted, state.length); // Check that we didn't get one last unshift.

						if (!state.endEmitted && state.length === 0) {
							state.endEmitted = true;
							stream.readable = false;
							stream.emit("end");
						}
					}

					function indexOf(xs, x) {
						for (var i = 0, l = xs.length; i < l; i++) {
							if (xs[i] === x) return i;
						}

						return -1;
					}
				}).call(
					this,
					require("_process"),
					typeof global !== "undefined"
						? global
						: typeof self !== "undefined"
						? self
						: typeof window !== "undefined"
						? window
						: {}
				);
			},
			{
				"../errors": 25,
				"../experimentalWarning": 26,
				"./_stream_duplex": 27,
				"./internal/streams/async_iterator": 32,
				"./internal/streams/buffer_list": 33,
				"./internal/streams/destroy": 34,
				"./internal/streams/state": 37,
				"./internal/streams/stream": 38,
				_process: 23,
				buffer: 16,
				events: "events",
				inherits: 20,
				"string_decoder/": 46,
				util: 15,
			},
		],
		30: [
			function (require, module, exports) {
				// Copyright Joyent, Inc. and other Node contributors.
				//
				// Permission is hereby granted, free of charge, to any person obtaining a
				// copy of this software and associated documentation files (the
				// "Software"), to deal in the Software without restriction, including
				// without limitation the rights to use, copy, modify, merge, publish,
				// distribute, sublicense, and/or sell copies of the Software, and to permit
				// persons to whom the Software is furnished to do so, subject to the
				// following conditions:
				//
				// The above copyright notice and this permission notice shall be included
				// in all copies or substantial portions of the Software.
				//
				// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
				// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
				// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
				// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
				// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
				// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
				// USE OR OTHER DEALINGS IN THE SOFTWARE.
				// a transform stream is a readable/writable stream where you do
				// something with the data.  Sometimes it's called a "filter",
				// but that's not a great name for it, since that implies a thing where
				// some bits pass through, and others are simply ignored.  (That would
				// be a valid example of a transform, of course.)
				//
				// While the output is causally related to the input, it's not a
				// necessarily symmetric or synchronous transformation.  For example,
				// a zlib stream might take multiple plain-text writes(), and then
				// emit a single compressed chunk some time in the future.
				//
				// Here's how this works:
				//
				// The Transform stream has all the aspects of the readable and writable
				// stream classes.  When you write(chunk), that calls _write(chunk,cb)
				// internally, and returns false if there's a lot of pending writes
				// buffered up.  When you call read(), that calls _read(n) until
				// there's enough pending readable data buffered up.
				//
				// In a transform stream, the written data is placed in a buffer.  When
				// _read(n) is called, it transforms the queued up data, calling the
				// buffered _write cb's as it consumes chunks.  If consuming a single
				// written chunk would result in multiple output chunks, then the first
				// outputted bit calls the readcb, and subsequent chunks just go into
				// the read buffer, and will cause it to emit 'readable' if necessary.
				//
				// This way, back-pressure is actually determined by the reading side,
				// since _read has to be called to start processing a new chunk.  However,
				// a pathological inflate type of transform can cause excessive buffering
				// here.  For example, imagine a stream where every byte of input is
				// interpreted as an integer from 0-255, and then results in that many
				// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
				// 1kb of data being output.  In this case, you could write a very small
				// amount of input, and end up with a very large amount of output.  In
				// such a pathological inflating mechanism, there'd be no way to tell
				// the system to stop doing the transform.  A single 4MB write could
				// cause the system to run out of memory.
				//
				// However, even in such a pathological case, only a single written chunk
				// would be consumed, and then the rest would wait (un-transformed) until
				// the results of the previous transformed chunk were consumed.
				"use strict";

				module.exports = Transform;

				var _require$codes = require("../errors").codes,
					ERR_METHOD_NOT_IMPLEMENTED =
						_require$codes.ERR_METHOD_NOT_IMPLEMENTED,
					ERR_MULTIPLE_CALLBACK =
						_require$codes.ERR_MULTIPLE_CALLBACK,
					ERR_TRANSFORM_ALREADY_TRANSFORMING =
						_require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING,
					ERR_TRANSFORM_WITH_LENGTH_0 =
						_require$codes.ERR_TRANSFORM_WITH_LENGTH_0;

				var Duplex = require("./_stream_duplex");

				require("inherits")(Transform, Duplex);

				function afterTransform(er, data) {
					var ts = this._transformState;
					ts.transforming = false;
					var cb = ts.writecb;

					if (cb === null) {
						return this.emit("error", new ERR_MULTIPLE_CALLBACK());
					}

					ts.writechunk = null;
					ts.writecb = null;
					if (data != null)
						// single equals check for both `null` and `undefined`
						this.push(data);
					cb(er);
					var rs = this._readableState;
					rs.reading = false;

					if (rs.needReadable || rs.length < rs.highWaterMark) {
						this._read(rs.highWaterMark);
					}
				}

				function Transform(options) {
					if (!(this instanceof Transform))
						return new Transform(options);
					Duplex.call(this, options);
					this._transformState = {
						afterTransform: afterTransform.bind(this),
						needTransform: false,
						transforming: false,
						writecb: null,
						writechunk: null,
						writeencoding: null,
					}; // start out asking for a readable event once data is transformed.

					this._readableState.needReadable = true; // we have implemented the _read method, and done the other things
					// that Readable wants before the first _read call, so unset the
					// sync guard flag.

					this._readableState.sync = false;

					if (options) {
						if (typeof options.transform === "function")
							this._transform = options.transform;
						if (typeof options.flush === "function")
							this._flush = options.flush;
					} // When the writable side finishes, then flush out anything remaining.

					this.on("prefinish", prefinish);
				}

				function prefinish() {
					var _this = this;

					if (
						typeof this._flush === "function" &&
						!this._readableState.destroyed
					) {
						this._flush(function (er, data) {
							done(_this, er, data);
						});
					} else {
						done(this, null, null);
					}
				}

				Transform.prototype.push = function (chunk, encoding) {
					this._transformState.needTransform = false;
					return Duplex.prototype.push.call(this, chunk, encoding);
				}; // This is the part where you do stuff!
				// override this function in implementation classes.
				// 'chunk' is an input chunk.
				//
				// Call `push(newChunk)` to pass along transformed output
				// to the readable side.  You may call 'push' zero or more times.
				//
				// Call `cb(err)` when you are done with this chunk.  If you pass
				// an error, then that'll put the hurt on the whole operation.  If you
				// never call cb(), then you'll never get another chunk.

				Transform.prototype._transform = function (
					chunk,
					encoding,
					cb
				) {
					cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
				};

				Transform.prototype._write = function (chunk, encoding, cb) {
					var ts = this._transformState;
					ts.writecb = cb;
					ts.writechunk = chunk;
					ts.writeencoding = encoding;

					if (!ts.transforming) {
						var rs = this._readableState;
						if (
							ts.needTransform ||
							rs.needReadable ||
							rs.length < rs.highWaterMark
						)
							this._read(rs.highWaterMark);
					}
				}; // Doesn't matter what the args are here.
				// _transform does all the work.
				// That we got here means that the readable side wants more data.

				Transform.prototype._read = function (n) {
					var ts = this._transformState;

					if (ts.writechunk !== null && !ts.transforming) {
						ts.transforming = true;

						this._transform(
							ts.writechunk,
							ts.writeencoding,
							ts.afterTransform
						);
					} else {
						// mark that we need a transform, so that any data that comes in
						// will get processed, now that we've asked for it.
						ts.needTransform = true;
					}
				};

				Transform.prototype._destroy = function (err, cb) {
					Duplex.prototype._destroy.call(this, err, function (err2) {
						cb(err2);
					});
				};

				function done(stream, er, data) {
					if (er) return stream.emit("error", er);
					if (data != null)
						// single equals check for both `null` and `undefined`
						stream.push(data); // TODO(BridgeAR): Write a test for these two error cases
					// if there's nothing in the write buffer, then that means
					// that nothing more will ever be provided

					if (stream._writableState.length)
						throw new ERR_TRANSFORM_WITH_LENGTH_0();
					if (stream._transformState.transforming)
						throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
					return stream.push(null);
				}
			},
			{ "../errors": 25, "./_stream_duplex": 27, inherits: 20 },
		],
		31: [
			function (require, module, exports) {
				(function (process, global) {
					// Copyright Joyent, Inc. and other Node contributors.
					//
					// Permission is hereby granted, free of charge, to any person obtaining a
					// copy of this software and associated documentation files (the
					// "Software"), to deal in the Software without restriction, including
					// without limitation the rights to use, copy, modify, merge, publish,
					// distribute, sublicense, and/or sell copies of the Software, and to permit
					// persons to whom the Software is furnished to do so, subject to the
					// following conditions:
					//
					// The above copyright notice and this permission notice shall be included
					// in all copies or substantial portions of the Software.
					//
					// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
					// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
					// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
					// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
					// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
					// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
					// USE OR OTHER DEALINGS IN THE SOFTWARE.
					// A bit simpler than readable streams.
					// Implement an async ._write(chunk, encoding, cb), and it'll handle all
					// the drain event emission and buffering.
					"use strict";

					module.exports = Writable;
					/* <replacement> */

					function WriteReq(chunk, encoding, cb) {
						this.chunk = chunk;
						this.encoding = encoding;
						this.callback = cb;
						this.next = null;
					} // It seems a linked list but it is not
					// there will be only 2 of these for each stream

					function CorkedRequest(state) {
						var _this = this;

						this.next = null;
						this.entry = null;

						this.finish = function () {
							onCorkedFinish(_this, state);
						};
					}
					/* </replacement> */

					/*<replacement>*/

					var Duplex;
					/*</replacement>*/

					Writable.WritableState = WritableState;
					/*<replacement>*/

					var internalUtil = {
						deprecate: require("util-deprecate"),
					};
					/*</replacement>*/

					/*<replacement>*/

					var Stream = require("./internal/streams/stream");
					/*</replacement>*/

					var Buffer = require("buffer").Buffer;

					var OurUint8Array = global.Uint8Array || function () {};

					function _uint8ArrayToBuffer(chunk) {
						return Buffer.from(chunk);
					}

					function _isUint8Array(obj) {
						return (
							Buffer.isBuffer(obj) || obj instanceof OurUint8Array
						);
					}

					var destroyImpl = require("./internal/streams/destroy");

					var _require = require("./internal/streams/state"),
						getHighWaterMark = _require.getHighWaterMark;

					var _require$codes = require("../errors").codes,
						ERR_INVALID_ARG_TYPE =
							_require$codes.ERR_INVALID_ARG_TYPE,
						ERR_METHOD_NOT_IMPLEMENTED =
							_require$codes.ERR_METHOD_NOT_IMPLEMENTED,
						ERR_MULTIPLE_CALLBACK =
							_require$codes.ERR_MULTIPLE_CALLBACK,
						ERR_STREAM_CANNOT_PIPE =
							_require$codes.ERR_STREAM_CANNOT_PIPE,
						ERR_STREAM_DESTROYED =
							_require$codes.ERR_STREAM_DESTROYED,
						ERR_STREAM_NULL_VALUES =
							_require$codes.ERR_STREAM_NULL_VALUES,
						ERR_STREAM_WRITE_AFTER_END =
							_require$codes.ERR_STREAM_WRITE_AFTER_END,
						ERR_UNKNOWN_ENCODING =
							_require$codes.ERR_UNKNOWN_ENCODING;

					require("inherits")(Writable, Stream);

					function nop() {}

					function WritableState(options, stream, isDuplex) {
						Duplex = Duplex || require("./_stream_duplex");
						options = options || {}; // Duplex streams are both readable and writable, but share
						// the same options object.
						// However, some cases require setting options to different
						// values for the readable and the writable sides of the duplex stream,
						// e.g. options.readableObjectMode vs. options.writableObjectMode, etc.

						if (typeof isDuplex !== "boolean")
							isDuplex = stream instanceof Duplex; // object stream flag to indicate whether or not this stream
						// contains buffers or objects.

						this.objectMode = !!options.objectMode;
						if (isDuplex)
							this.objectMode =
								this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
						// Note: 0 is a valid value, means that we always return false if
						// the entire buffer is not flushed immediately on write()

						this.highWaterMark = getHighWaterMark(
							this,
							options,
							"writableHighWaterMark",
							isDuplex
						); // if _final has been called

						this.finalCalled = false; // drain event flag.

						this.needDrain = false; // at the start of calling end()

						this.ending = false; // when end() has been called, and returned

						this.ended = false; // when 'finish' is emitted

						this.finished = false; // has it been destroyed

						this.destroyed = false; // should we decode strings into buffers before passing to _write?
						// this is here so that some node-core streams can optimize string
						// handling at a lower level.

						var noDecode = options.decodeStrings === false;
						this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
						// encoding is 'binary' so we have to make this configurable.
						// Everything else in the universe uses 'utf8', though.

						this.defaultEncoding =
							options.defaultEncoding || "utf8"; // not an actual buffer we keep track of, but a measurement
						// of how much we're waiting to get pushed to some underlying
						// socket or file.

						this.length = 0; // a flag to see when we're in the middle of a write.

						this.writing = false; // when true all writes will be buffered until .uncork() call

						this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
						// or on a later tick.  We set this to true at first, because any
						// actions that shouldn't happen until "later" should generally also
						// not happen before the first write call.

						this.sync = true; // a flag to know if we're processing previously buffered items, which
						// may call the _write() callback in the same tick, so that we don't
						// end up in an overlapped onwrite situation.

						this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

						this.onwrite = function (er) {
							onwrite(stream, er);
						}; // the callback that the user supplies to write(chunk,encoding,cb)

						this.writecb = null; // the amount that is being written when _write is called.

						this.writelen = 0;
						this.bufferedRequest = null;
						this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
						// this must be 0 before 'finish' can be emitted

						this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
						// This is relevant for synchronous Transform streams

						this.prefinished = false; // True if the error was already emitted and should not be thrown again

						this.errorEmitted = false; // Should close be emitted on destroy. Defaults to true.

						this.emitClose = options.emitClose !== false; // count buffered requests

						this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
						// one allocated and free to use, and we maintain at most two

						this.corkedRequestsFree = new CorkedRequest(this);
					}

					WritableState.prototype.getBuffer = function getBuffer() {
						var current = this.bufferedRequest;
						var out = [];

						while (current) {
							out.push(current);
							current = current.next;
						}

						return out;
					};

					(function () {
						try {
							Object.defineProperty(
								WritableState.prototype,
								"buffer",
								{
									get: internalUtil.deprecate(
										function writableStateBufferGetter() {
											return this.getBuffer();
										},
										"_writableState.buffer is deprecated. Use _writableState.getBuffer " +
											"instead.",
										"DEP0003"
									),
								}
							);
						} catch (_) {}
					})(); // Test _writableState for inheritance to account for Duplex streams,
					// whose prototype chain only points to Readable.

					var realHasInstance;

					if (
						typeof Symbol === "function" &&
						Symbol.hasInstance &&
						typeof Function.prototype[Symbol.hasInstance] ===
							"function"
					) {
						realHasInstance =
							Function.prototype[Symbol.hasInstance];
						Object.defineProperty(Writable, Symbol.hasInstance, {
							value: function value(object) {
								if (realHasInstance.call(this, object))
									return true;
								if (this !== Writable) return false;
								return (
									object &&
									object._writableState instanceof
										WritableState
								);
							},
						});
					} else {
						realHasInstance = function realHasInstance(object) {
							return object instanceof this;
						};
					}

					function Writable(options) {
						Duplex = Duplex || require("./_stream_duplex"); // Writable ctor is applied to Duplexes, too.
						// `realHasInstance` is necessary because using plain `instanceof`
						// would return false, as no `_writableState` property is attached.
						// Trying to use the custom `instanceof` for Writable here will also break the
						// Node.js LazyTransform implementation, which has a non-trivial getter for
						// `_writableState` that would lead to infinite recursion.
						// Checking for a Stream.Duplex instance is faster here instead of inside
						// the WritableState constructor, at least with V8 6.5

						var isDuplex = this instanceof Duplex;
						if (!isDuplex && !realHasInstance.call(Writable, this))
							return new Writable(options);
						this._writableState = new WritableState(
							options,
							this,
							isDuplex
						); // legacy.

						this.writable = true;

						if (options) {
							if (typeof options.write === "function")
								this._write = options.write;
							if (typeof options.writev === "function")
								this._writev = options.writev;
							if (typeof options.destroy === "function")
								this._destroy = options.destroy;
							if (typeof options.final === "function")
								this._final = options.final;
						}

						Stream.call(this);
					} // Otherwise people can pipe Writable streams, which is just wrong.

					Writable.prototype.pipe = function () {
						this.emit("error", new ERR_STREAM_CANNOT_PIPE());
					};

					function writeAfterEnd(stream, cb) {
						var er = new ERR_STREAM_WRITE_AFTER_END(); // TODO: defer error events consistently everywhere, not just the cb

						stream.emit("error", er);
						process.nextTick(cb, er);
					} // Checks that a user-supplied chunk is valid, especially for the particular
					// mode the stream is in. Currently this means that `null` is never accepted
					// and undefined/non-string values are only allowed in object mode.

					function validChunk(stream, state, chunk, cb) {
						var er;

						if (chunk === null) {
							er = new ERR_STREAM_NULL_VALUES();
						} else if (
							typeof chunk !== "string" &&
							!state.objectMode
						) {
							er = new ERR_INVALID_ARG_TYPE(
								"chunk",
								["string", "Buffer"],
								chunk
							);
						}

						if (er) {
							stream.emit("error", er);
							process.nextTick(cb, er);
							return false;
						}

						return true;
					}

					Writable.prototype.write = function (chunk, encoding, cb) {
						var state = this._writableState;
						var ret = false;

						var isBuf = !state.objectMode && _isUint8Array(chunk);

						if (isBuf && !Buffer.isBuffer(chunk)) {
							chunk = _uint8ArrayToBuffer(chunk);
						}

						if (typeof encoding === "function") {
							cb = encoding;
							encoding = null;
						}

						if (isBuf) encoding = "buffer";
						else if (!encoding) encoding = state.defaultEncoding;
						if (typeof cb !== "function") cb = nop;
						if (state.ending) writeAfterEnd(this, cb);
						else if (isBuf || validChunk(this, state, chunk, cb)) {
							state.pendingcb++;
							ret = writeOrBuffer(
								this,
								state,
								isBuf,
								chunk,
								encoding,
								cb
							);
						}
						return ret;
					};

					Writable.prototype.cork = function () {
						this._writableState.corked++;
					};

					Writable.prototype.uncork = function () {
						var state = this._writableState;

						if (state.corked) {
							state.corked--;
							if (
								!state.writing &&
								!state.corked &&
								!state.bufferProcessing &&
								state.bufferedRequest
							)
								clearBuffer(this, state);
						}
					};

					Writable.prototype.setDefaultEncoding =
						function setDefaultEncoding(encoding) {
							// node::ParseEncoding() requires lower case.
							if (typeof encoding === "string")
								encoding = encoding.toLowerCase();
							if (
								!(
									[
										"hex",
										"utf8",
										"utf-8",
										"ascii",
										"binary",
										"base64",
										"ucs2",
										"ucs-2",
										"utf16le",
										"utf-16le",
										"raw",
									].indexOf((encoding + "").toLowerCase()) >
									-1
								)
							)
								throw new ERR_UNKNOWN_ENCODING(encoding);
							this._writableState.defaultEncoding = encoding;
							return this;
						};

					Object.defineProperty(
						Writable.prototype,
						"writableBuffer",
						{
							// making it explicit this property is not enumerable
							// because otherwise some prototype manipulation in
							// userland will fail
							enumerable: false,
							get: function get() {
								return (
									this._writableState &&
									this._writableState.getBuffer()
								);
							},
						}
					);

					function decodeChunk(state, chunk, encoding) {
						if (
							!state.objectMode &&
							state.decodeStrings !== false &&
							typeof chunk === "string"
						) {
							chunk = Buffer.from(chunk, encoding);
						}

						return chunk;
					}

					Object.defineProperty(
						Writable.prototype,
						"writableHighWaterMark",
						{
							// making it explicit this property is not enumerable
							// because otherwise some prototype manipulation in
							// userland will fail
							enumerable: false,
							get: function get() {
								return this._writableState.highWaterMark;
							},
						}
					); // if we're already writing something, then just put this
					// in the queue, and wait our turn.  Otherwise, call _write
					// If we return false, then we need a drain event, so set that flag.

					function writeOrBuffer(
						stream,
						state,
						isBuf,
						chunk,
						encoding,
						cb
					) {
						if (!isBuf) {
							var newChunk = decodeChunk(state, chunk, encoding);

							if (chunk !== newChunk) {
								isBuf = true;
								encoding = "buffer";
								chunk = newChunk;
							}
						}

						var len = state.objectMode ? 1 : chunk.length;
						state.length += len;
						var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

						if (!ret) state.needDrain = true;

						if (state.writing || state.corked) {
							var last = state.lastBufferedRequest;
							state.lastBufferedRequest = {
								chunk: chunk,
								encoding: encoding,
								isBuf: isBuf,
								callback: cb,
								next: null,
							};

							if (last) {
								last.next = state.lastBufferedRequest;
							} else {
								state.bufferedRequest =
									state.lastBufferedRequest;
							}

							state.bufferedRequestCount += 1;
						} else {
							doWrite(
								stream,
								state,
								false,
								len,
								chunk,
								encoding,
								cb
							);
						}

						return ret;
					}

					function doWrite(
						stream,
						state,
						writev,
						len,
						chunk,
						encoding,
						cb
					) {
						state.writelen = len;
						state.writecb = cb;
						state.writing = true;
						state.sync = true;
						if (state.destroyed)
							state.onwrite(new ERR_STREAM_DESTROYED("write"));
						else if (writev) stream._writev(chunk, state.onwrite);
						else stream._write(chunk, encoding, state.onwrite);
						state.sync = false;
					}

					function onwriteError(stream, state, sync, er, cb) {
						--state.pendingcb;

						if (sync) {
							// defer the callback if we are being called synchronously
							// to avoid piling up things on the stack
							process.nextTick(cb, er); // this can emit finish, and it will always happen
							// after error

							process.nextTick(finishMaybe, stream, state);
							stream._writableState.errorEmitted = true;
							stream.emit("error", er);
						} else {
							// the caller expect this to happen before if
							// it is async
							cb(er);
							stream._writableState.errorEmitted = true;
							stream.emit("error", er); // this can emit finish, but finish must
							// always follow error

							finishMaybe(stream, state);
						}
					}

					function onwriteStateUpdate(state) {
						state.writing = false;
						state.writecb = null;
						state.length -= state.writelen;
						state.writelen = 0;
					}

					function onwrite(stream, er) {
						var state = stream._writableState;
						var sync = state.sync;
						var cb = state.writecb;
						if (typeof cb !== "function")
							throw new ERR_MULTIPLE_CALLBACK();
						onwriteStateUpdate(state);
						if (er) onwriteError(stream, state, sync, er, cb);
						else {
							// Check if we're actually ready to finish, but don't emit yet
							var finished =
								needFinish(state) || stream.destroyed;

							if (
								!finished &&
								!state.corked &&
								!state.bufferProcessing &&
								state.bufferedRequest
							) {
								clearBuffer(stream, state);
							}

							if (sync) {
								process.nextTick(
									afterWrite,
									stream,
									state,
									finished,
									cb
								);
							} else {
								afterWrite(stream, state, finished, cb);
							}
						}
					}

					function afterWrite(stream, state, finished, cb) {
						if (!finished) onwriteDrain(stream, state);
						state.pendingcb--;
						cb();
						finishMaybe(stream, state);
					} // Must force callback to be called on nextTick, so that we don't
					// emit 'drain' before the write() consumer gets the 'false' return
					// value, and has a chance to attach a 'drain' listener.

					function onwriteDrain(stream, state) {
						if (state.length === 0 && state.needDrain) {
							state.needDrain = false;
							stream.emit("drain");
						}
					} // if there's something in the buffer waiting, then process it

					function clearBuffer(stream, state) {
						state.bufferProcessing = true;
						var entry = state.bufferedRequest;

						if (stream._writev && entry && entry.next) {
							// Fast case, write everything using _writev()
							var l = state.bufferedRequestCount;
							var buffer = new Array(l);
							var holder = state.corkedRequestsFree;
							holder.entry = entry;
							var count = 0;
							var allBuffers = true;

							while (entry) {
								buffer[count] = entry;
								if (!entry.isBuf) allBuffers = false;
								entry = entry.next;
								count += 1;
							}

							buffer.allBuffers = allBuffers;
							doWrite(
								stream,
								state,
								true,
								state.length,
								buffer,
								"",
								holder.finish
							); // doWrite is almost always async, defer these to save a bit of time
							// as the hot path ends with doWrite

							state.pendingcb++;
							state.lastBufferedRequest = null;

							if (holder.next) {
								state.corkedRequestsFree = holder.next;
								holder.next = null;
							} else {
								state.corkedRequestsFree = new CorkedRequest(
									state
								);
							}

							state.bufferedRequestCount = 0;
						} else {
							// Slow case, write chunks one-by-one
							while (entry) {
								var chunk = entry.chunk;
								var encoding = entry.encoding;
								var cb = entry.callback;
								var len = state.objectMode ? 1 : chunk.length;
								doWrite(
									stream,
									state,
									false,
									len,
									chunk,
									encoding,
									cb
								);
								entry = entry.next;
								state.bufferedRequestCount--; // if we didn't call the onwrite immediately, then
								// it means that we need to wait until it does.
								// also, that means that the chunk and cb are currently
								// being processed, so move the buffer counter past them.

								if (state.writing) {
									break;
								}
							}

							if (entry === null)
								state.lastBufferedRequest = null;
						}

						state.bufferedRequest = entry;
						state.bufferProcessing = false;
					}

					Writable.prototype._write = function (chunk, encoding, cb) {
						cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
					};

					Writable.prototype._writev = null;

					Writable.prototype.end = function (chunk, encoding, cb) {
						var state = this._writableState;

						if (typeof chunk === "function") {
							cb = chunk;
							chunk = null;
							encoding = null;
						} else if (typeof encoding === "function") {
							cb = encoding;
							encoding = null;
						}

						if (chunk !== null && chunk !== undefined)
							this.write(chunk, encoding); // .end() fully uncorks

						if (state.corked) {
							state.corked = 1;
							this.uncork();
						} // ignore unnecessary end() calls.

						if (!state.ending) endWritable(this, state, cb);
						return this;
					};

					Object.defineProperty(
						Writable.prototype,
						"writableLength",
						{
							// making it explicit this property is not enumerable
							// because otherwise some prototype manipulation in
							// userland will fail
							enumerable: false,
							get: function get() {
								return this._writableState.length;
							},
						}
					);

					function needFinish(state) {
						return (
							state.ending &&
							state.length === 0 &&
							state.bufferedRequest === null &&
							!state.finished &&
							!state.writing
						);
					}

					function callFinal(stream, state) {
						stream._final(function (err) {
							state.pendingcb--;

							if (err) {
								stream.emit("error", err);
							}

							state.prefinished = true;
							stream.emit("prefinish");
							finishMaybe(stream, state);
						});
					}

					function prefinish(stream, state) {
						if (!state.prefinished && !state.finalCalled) {
							if (
								typeof stream._final === "function" &&
								!state.destroyed
							) {
								state.pendingcb++;
								state.finalCalled = true;
								process.nextTick(callFinal, stream, state);
							} else {
								state.prefinished = true;
								stream.emit("prefinish");
							}
						}
					}

					function finishMaybe(stream, state) {
						var need = needFinish(state);

						if (need) {
							prefinish(stream, state);

							if (state.pendingcb === 0) {
								state.finished = true;
								stream.emit("finish");
							}
						}

						return need;
					}

					function endWritable(stream, state, cb) {
						state.ending = true;
						finishMaybe(stream, state);

						if (cb) {
							if (state.finished) process.nextTick(cb);
							else stream.once("finish", cb);
						}

						state.ended = true;
						stream.writable = false;
					}

					function onCorkedFinish(corkReq, state, err) {
						var entry = corkReq.entry;
						corkReq.entry = null;

						while (entry) {
							var cb = entry.callback;
							state.pendingcb--;
							cb(err);
							entry = entry.next;
						} // reuse the free corkReq.

						state.corkedRequestsFree.next = corkReq;
					}

					Object.defineProperty(Writable.prototype, "destroyed", {
						// making it explicit this property is not enumerable
						// because otherwise some prototype manipulation in
						// userland will fail
						enumerable: false,
						get: function get() {
							if (this._writableState === undefined) {
								return false;
							}

							return this._writableState.destroyed;
						},
						set: function set(value) {
							// we ignore the value if the stream
							// has not been initialized yet
							if (!this._writableState) {
								return;
							} // backward compatibility, the user is explicitly
							// managing destroyed

							this._writableState.destroyed = value;
						},
					});
					Writable.prototype.destroy = destroyImpl.destroy;
					Writable.prototype._undestroy = destroyImpl.undestroy;

					Writable.prototype._destroy = function (err, cb) {
						cb(err);
					};
				}).call(
					this,
					require("_process"),
					typeof global !== "undefined"
						? global
						: typeof self !== "undefined"
						? self
						: typeof window !== "undefined"
						? window
						: {}
				);
			},
			{
				"../errors": 25,
				"./_stream_duplex": 27,
				"./internal/streams/destroy": 34,
				"./internal/streams/state": 37,
				"./internal/streams/stream": 38,
				_process: 23,
				buffer: 16,
				inherits: 20,
				"util-deprecate": 48,
			},
		],
		32: [
			function (require, module, exports) {
				(function (process) {
					"use strict";

					var _Object$setPrototypeO;

					function _defineProperty(obj, key, value) {
						if (key in obj) {
							Object.defineProperty(obj, key, {
								value: value,
								enumerable: true,
								configurable: true,
								writable: true,
							});
						} else {
							obj[key] = value;
						}
						return obj;
					}

					var finished = require("./end-of-stream");

					var kLastResolve = Symbol("lastResolve");
					var kLastReject = Symbol("lastReject");
					var kError = Symbol("error");
					var kEnded = Symbol("ended");
					var kLastPromise = Symbol("lastPromise");
					var kHandlePromise = Symbol("handlePromise");
					var kStream = Symbol("stream");

					function createIterResult(value, done) {
						return {
							value: value,
							done: done,
						};
					}

					function readAndResolve(iter) {
						var resolve = iter[kLastResolve];

						if (resolve !== null) {
							var data = iter[kStream].read(); // we defer if data is null
							// we can be expecting either 'end' or
							// 'error'

							if (data !== null) {
								iter[kLastPromise] = null;
								iter[kLastResolve] = null;
								iter[kLastReject] = null;
								resolve(createIterResult(data, false));
							}
						}
					}

					function onReadable(iter) {
						// we wait for the next tick, because it might
						// emit an error with process.nextTick
						process.nextTick(readAndResolve, iter);
					}

					function wrapForNext(lastPromise, iter) {
						return function (resolve, reject) {
							lastPromise.then(function () {
								if (iter[kEnded]) {
									resolve(createIterResult(undefined, true));
									return;
								}

								iter[kHandlePromise](resolve, reject);
							}, reject);
						};
					}

					var AsyncIteratorPrototype = Object.getPrototypeOf(
						function () {}
					);
					var ReadableStreamAsyncIteratorPrototype =
						Object.setPrototypeOf(
							((_Object$setPrototypeO = {
								get stream() {
									return this[kStream];
								},

								next: function next() {
									var _this = this;

									// if we have detected an error in the meanwhile
									// reject straight away
									var error = this[kError];

									if (error !== null) {
										return Promise.reject(error);
									}

									if (this[kEnded]) {
										return Promise.resolve(
											createIterResult(undefined, true)
										);
									}

									if (this[kStream].destroyed) {
										// We need to defer via nextTick because if .destroy(err) is
										// called, the error will be emitted via nextTick, and
										// we cannot guarantee that there is no error lingering around
										// waiting to be emitted.
										return new Promise(function (
											resolve,
											reject
										) {
											process.nextTick(function () {
												if (_this[kError]) {
													reject(_this[kError]);
												} else {
													resolve(
														createIterResult(
															undefined,
															true
														)
													);
												}
											});
										});
									} // if we have multiple next() calls
									// we will wait for the previous Promise to finish
									// this logic is optimized to support for await loops,
									// where next() is only called once at a time

									var lastPromise = this[kLastPromise];
									var promise;

									if (lastPromise) {
										promise = new Promise(
											wrapForNext(lastPromise, this)
										);
									} else {
										// fast path needed to support multiple this.push()
										// without triggering the next() queue
										var data = this[kStream].read();

										if (data !== null) {
											return Promise.resolve(
												createIterResult(data, false)
											);
										}

										promise = new Promise(
											this[kHandlePromise]
										);
									}

									this[kLastPromise] = promise;
									return promise;
								},
							}),
							_defineProperty(
								_Object$setPrototypeO,
								Symbol.asyncIterator,
								function () {
									return this;
								}
							),
							_defineProperty(
								_Object$setPrototypeO,
								"return",
								function _return() {
									var _this2 = this;

									// destroy(err, cb) is a private API
									// we can guarantee we have that here, because we control the
									// Readable class this is attached to
									return new Promise(function (
										resolve,
										reject
									) {
										_this2[kStream].destroy(
											null,
											function (err) {
												if (err) {
													reject(err);
													return;
												}

												resolve(
													createIterResult(
														undefined,
														true
													)
												);
											}
										);
									});
								}
							),
							_Object$setPrototypeO),
							AsyncIteratorPrototype
						);

					var createReadableStreamAsyncIterator =
						function createReadableStreamAsyncIterator(stream) {
							var _Object$create;

							var iterator = Object.create(
								ReadableStreamAsyncIteratorPrototype,
								((_Object$create = {}),
								_defineProperty(_Object$create, kStream, {
									value: stream,
									writable: true,
								}),
								_defineProperty(_Object$create, kLastResolve, {
									value: null,
									writable: true,
								}),
								_defineProperty(_Object$create, kLastReject, {
									value: null,
									writable: true,
								}),
								_defineProperty(_Object$create, kError, {
									value: null,
									writable: true,
								}),
								_defineProperty(_Object$create, kEnded, {
									value: stream._readableState.endEmitted,
									writable: true,
								}),
								_defineProperty(
									_Object$create,
									kHandlePromise,
									{
										value: function value(resolve, reject) {
											var data = iterator[kStream].read();

											if (data) {
												iterator[kLastPromise] = null;
												iterator[kLastResolve] = null;
												iterator[kLastReject] = null;
												resolve(
													createIterResult(
														data,
														false
													)
												);
											} else {
												iterator[kLastResolve] =
													resolve;
												iterator[kLastReject] = reject;
											}
										},
										writable: true,
									}
								),
								_Object$create)
							);
							iterator[kLastPromise] = null;
							finished(stream, function (err) {
								if (
									err &&
									err.code !== "ERR_STREAM_PREMATURE_CLOSE"
								) {
									var reject = iterator[kLastReject]; // reject if we are waiting for data in the Promise
									// returned by next() and store the error

									if (reject !== null) {
										iterator[kLastPromise] = null;
										iterator[kLastResolve] = null;
										iterator[kLastReject] = null;
										reject(err);
									}

									iterator[kError] = err;
									return;
								}

								var resolve = iterator[kLastResolve];

								if (resolve !== null) {
									iterator[kLastPromise] = null;
									iterator[kLastResolve] = null;
									iterator[kLastReject] = null;
									resolve(createIterResult(undefined, true));
								}

								iterator[kEnded] = true;
							});
							stream.on(
								"readable",
								onReadable.bind(null, iterator)
							);
							return iterator;
						};

					module.exports = createReadableStreamAsyncIterator;
				}).call(this, require("_process"));
			},
			{ "./end-of-stream": 35, _process: 23 },
		],
		33: [
			function (require, module, exports) {
				"use strict";

				function _objectSpread(target) {
					for (var i = 1; i < arguments.length; i++) {
						var source = arguments[i] != null ? arguments[i] : {};
						var ownKeys = Object.keys(source);
						if (
							typeof Object.getOwnPropertySymbols === "function"
						) {
							ownKeys = ownKeys.concat(
								Object.getOwnPropertySymbols(source).filter(
									function (sym) {
										return Object.getOwnPropertyDescriptor(
											source,
											sym
										).enumerable;
									}
								)
							);
						}
						ownKeys.forEach(function (key) {
							_defineProperty(target, key, source[key]);
						});
					}
					return target;
				}

				function _defineProperty(obj, key, value) {
					if (key in obj) {
						Object.defineProperty(obj, key, {
							value: value,
							enumerable: true,
							configurable: true,
							writable: true,
						});
					} else {
						obj[key] = value;
					}
					return obj;
				}

				var _require = require("buffer"),
					Buffer = _require.Buffer;

				var _require2 = require("util"),
					inspect = _require2.inspect;

				var custom = (inspect && inspect.custom) || "inspect";

				function copyBuffer(src, target, offset) {
					Buffer.prototype.copy.call(src, target, offset);
				}

				module.exports =
					/*#__PURE__*/
					(function () {
						function BufferList() {
							this.head = null;
							this.tail = null;
							this.length = 0;
						}

						var _proto = BufferList.prototype;

						_proto.push = function push(v) {
							var entry = {
								data: v,
								next: null,
							};
							if (this.length > 0) this.tail.next = entry;
							else this.head = entry;
							this.tail = entry;
							++this.length;
						};

						_proto.unshift = function unshift(v) {
							var entry = {
								data: v,
								next: this.head,
							};
							if (this.length === 0) this.tail = entry;
							this.head = entry;
							++this.length;
						};

						_proto.shift = function shift() {
							if (this.length === 0) return;
							var ret = this.head.data;
							if (this.length === 1) this.head = this.tail = null;
							else this.head = this.head.next;
							--this.length;
							return ret;
						};

						_proto.clear = function clear() {
							this.head = this.tail = null;
							this.length = 0;
						};

						_proto.join = function join(s) {
							if (this.length === 0) return "";
							var p = this.head;
							var ret = "" + p.data;

							while ((p = p.next)) {
								ret += s + p.data;
							}

							return ret;
						};

						_proto.concat = function concat(n) {
							if (this.length === 0) return Buffer.alloc(0);
							var ret = Buffer.allocUnsafe(n >>> 0);
							var p = this.head;
							var i = 0;

							while (p) {
								copyBuffer(p.data, ret, i);
								i += p.data.length;
								p = p.next;
							}

							return ret;
						}; // Consumes a specified amount of bytes or characters from the buffered data.

						_proto.consume = function consume(n, hasStrings) {
							var ret;

							if (n < this.head.data.length) {
								// `slice` is the same for buffers and strings.
								ret = this.head.data.slice(0, n);
								this.head.data = this.head.data.slice(n);
							} else if (n === this.head.data.length) {
								// First chunk is a perfect match.
								ret = this.shift();
							} else {
								// Result spans more than one buffer.
								ret = hasStrings
									? this._getString(n)
									: this._getBuffer(n);
							}

							return ret;
						};

						_proto.first = function first() {
							return this.head.data;
						}; // Consumes a specified amount of characters from the buffered data.

						_proto._getString = function _getString(n) {
							var p = this.head;
							var c = 1;
							var ret = p.data;
							n -= ret.length;

							while ((p = p.next)) {
								var str = p.data;
								var nb = n > str.length ? str.length : n;
								if (nb === str.length) ret += str;
								else ret += str.slice(0, n);
								n -= nb;

								if (n === 0) {
									if (nb === str.length) {
										++c;
										if (p.next) this.head = p.next;
										else this.head = this.tail = null;
									} else {
										this.head = p;
										p.data = str.slice(nb);
									}

									break;
								}

								++c;
							}

							this.length -= c;
							return ret;
						}; // Consumes a specified amount of bytes from the buffered data.

						_proto._getBuffer = function _getBuffer(n) {
							var ret = Buffer.allocUnsafe(n);
							var p = this.head;
							var c = 1;
							p.data.copy(ret);
							n -= p.data.length;

							while ((p = p.next)) {
								var buf = p.data;
								var nb = n > buf.length ? buf.length : n;
								buf.copy(ret, ret.length - n, 0, nb);
								n -= nb;

								if (n === 0) {
									if (nb === buf.length) {
										++c;
										if (p.next) this.head = p.next;
										else this.head = this.tail = null;
									} else {
										this.head = p;
										p.data = buf.slice(nb);
									}

									break;
								}

								++c;
							}

							this.length -= c;
							return ret;
						}; // Make sure the linked list only shows the minimal necessary information.

						_proto[custom] = function (_, options) {
							return inspect(
								this,
								_objectSpread({}, options, {
									// Only inspect one level.
									depth: 0,
									// It should not recurse.
									customInspect: false,
								})
							);
						};

						return BufferList;
					})();
			},
			{ buffer: 16, util: 15 },
		],
		34: [
			function (require, module, exports) {
				(function (process) {
					"use strict"; // undocumented cb() API, needed for core, not for public API

					function destroy(err, cb) {
						var _this = this;

						var readableDestroyed =
							this._readableState &&
							this._readableState.destroyed;
						var writableDestroyed =
							this._writableState &&
							this._writableState.destroyed;

						if (readableDestroyed || writableDestroyed) {
							if (cb) {
								cb(err);
							} else if (
								err &&
								(!this._writableState ||
									!this._writableState.errorEmitted)
							) {
								process.nextTick(emitErrorNT, this, err);
							}

							return this;
						} // we set destroyed to true before firing error callbacks in order
						// to make it re-entrance safe in case destroy() is called within callbacks

						if (this._readableState) {
							this._readableState.destroyed = true;
						} // if this is a duplex stream mark the writable part as destroyed as well

						if (this._writableState) {
							this._writableState.destroyed = true;
						}

						this._destroy(err || null, function (err) {
							if (!cb && err) {
								process.nextTick(
									emitErrorAndCloseNT,
									_this,
									err
								);

								if (_this._writableState) {
									_this._writableState.errorEmitted = true;
								}
							} else if (cb) {
								process.nextTick(emitCloseNT, _this);
								cb(err);
							} else {
								process.nextTick(emitCloseNT, _this);
							}
						});

						return this;
					}

					function emitErrorAndCloseNT(self, err) {
						emitErrorNT(self, err);
						emitCloseNT(self);
					}

					function emitCloseNT(self) {
						if (
							self._writableState &&
							!self._writableState.emitClose
						)
							return;
						if (
							self._readableState &&
							!self._readableState.emitClose
						)
							return;
						self.emit("close");
					}

					function undestroy() {
						if (this._readableState) {
							this._readableState.destroyed = false;
							this._readableState.reading = false;
							this._readableState.ended = false;
							this._readableState.endEmitted = false;
						}

						if (this._writableState) {
							this._writableState.destroyed = false;
							this._writableState.ended = false;
							this._writableState.ending = false;
							this._writableState.finalCalled = false;
							this._writableState.prefinished = false;
							this._writableState.finished = false;
							this._writableState.errorEmitted = false;
						}
					}

					function emitErrorNT(self, err) {
						self.emit("error", err);
					}

					module.exports = {
						destroy: destroy,
						undestroy: undestroy,
					};
				}).call(this, require("_process"));
			},
			{ _process: 23 },
		],
		35: [
			function (require, module, exports) {
				// Ported from https://github.com/mafintosh/end-of-stream with
				// permission from the author, Mathias Buus (@mafintosh).
				"use strict";

				var ERR_STREAM_PREMATURE_CLOSE =
					require("../../../errors").codes.ERR_STREAM_PREMATURE_CLOSE;

				function once(callback) {
					var called = false;
					return function () {
						if (called) return;
						called = true;

						for (
							var _len = arguments.length,
								args = new Array(_len),
								_key = 0;
							_key < _len;
							_key++
						) {
							args[_key] = arguments[_key];
						}

						callback.apply(this, args);
					};
				}

				function noop() {}

				function isRequest(stream) {
					return (
						stream.setHeader && typeof stream.abort === "function"
					);
				}

				function eos(stream, opts, callback) {
					if (typeof opts === "function")
						return eos(stream, null, opts);
					if (!opts) opts = {};
					callback = once(callback || noop);
					var readable =
						opts.readable ||
						(opts.readable !== false && stream.readable);
					var writable =
						opts.writable ||
						(opts.writable !== false && stream.writable);

					var onlegacyfinish = function onlegacyfinish() {
						if (!stream.writable) onfinish();
					};

					var writableEnded =
						stream._writableState && stream._writableState.finished;

					var onfinish = function onfinish() {
						writable = false;
						writableEnded = true;
						if (!readable) callback.call(stream);
					};

					var readableEnded =
						stream._readableState &&
						stream._readableState.endEmitted;

					var onend = function onend() {
						readable = false;
						readableEnded = true;
						if (!writable) callback.call(stream);
					};

					var onerror = function onerror(err) {
						callback.call(stream, err);
					};

					var onclose = function onclose() {
						var err;

						if (readable && !readableEnded) {
							if (
								!stream._readableState ||
								!stream._readableState.ended
							)
								err = new ERR_STREAM_PREMATURE_CLOSE();
							return callback.call(stream, err);
						}

						if (writable && !writableEnded) {
							if (
								!stream._writableState ||
								!stream._writableState.ended
							)
								err = new ERR_STREAM_PREMATURE_CLOSE();
							return callback.call(stream, err);
						}
					};

					var onrequest = function onrequest() {
						stream.req.on("finish", onfinish);
					};

					if (isRequest(stream)) {
						stream.on("complete", onfinish);
						stream.on("abort", onclose);
						if (stream.req) onrequest();
						else stream.on("request", onrequest);
					} else if (writable && !stream._writableState) {
						// legacy streams
						stream.on("end", onlegacyfinish);
						stream.on("close", onlegacyfinish);
					}

					stream.on("end", onend);
					stream.on("finish", onfinish);
					if (opts.error !== false) stream.on("error", onerror);
					stream.on("close", onclose);
					return function () {
						stream.removeListener("complete", onfinish);
						stream.removeListener("abort", onclose);
						stream.removeListener("request", onrequest);
						if (stream.req)
							stream.req.removeListener("finish", onfinish);
						stream.removeListener("end", onlegacyfinish);
						stream.removeListener("close", onlegacyfinish);
						stream.removeListener("finish", onfinish);
						stream.removeListener("end", onend);
						stream.removeListener("error", onerror);
						stream.removeListener("close", onclose);
					};
				}

				module.exports = eos;
			},
			{ "../../../errors": 25 },
		],
		36: [
			function (require, module, exports) {
				// Ported from https://github.com/mafintosh/pump with
				// permission from the author, Mathias Buus (@mafintosh).
				"use strict";

				var eos;

				function once(callback) {
					var called = false;
					return function () {
						if (called) return;
						called = true;
						callback.apply(void 0, arguments);
					};
				}

				var _require$codes = require("../../../errors").codes,
					ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS,
					ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;

				function noop(err) {
					// Rethrow the error if it exists to avoid swallowing it
					if (err) throw err;
				}

				function isRequest(stream) {
					return (
						stream.setHeader && typeof stream.abort === "function"
					);
				}

				function destroyer(stream, reading, writing, callback) {
					callback = once(callback);
					var closed = false;
					stream.on("close", function () {
						closed = true;
					});
					if (eos === undefined) eos = require("./end-of-stream");
					eos(
						stream,
						{
							readable: reading,
							writable: writing,
						},
						function (err) {
							if (err) return callback(err);
							closed = true;
							callback();
						}
					);
					var destroyed = false;
					return function (err) {
						if (closed) return;
						if (destroyed) return;
						destroyed = true; // request.destroy just do .end - .abort is what we want

						if (isRequest(stream)) return stream.abort();
						if (typeof stream.destroy === "function")
							return stream.destroy();
						callback(err || new ERR_STREAM_DESTROYED("pipe"));
					};
				}

				function call(fn) {
					fn();
				}

				function pipe(from, to) {
					return from.pipe(to);
				}

				function popCallback(streams) {
					if (!streams.length) return noop;
					if (typeof streams[streams.length - 1] !== "function")
						return noop;
					return streams.pop();
				}

				function pipeline() {
					for (
						var _len = arguments.length,
							streams = new Array(_len),
							_key = 0;
						_key < _len;
						_key++
					) {
						streams[_key] = arguments[_key];
					}

					var callback = popCallback(streams);
					if (Array.isArray(streams[0])) streams = streams[0];

					if (streams.length < 2) {
						throw new ERR_MISSING_ARGS("streams");
					}

					var error;
					var destroys = streams.map(function (stream, i) {
						var reading = i < streams.length - 1;
						var writing = i > 0;
						return destroyer(
							stream,
							reading,
							writing,
							function (err) {
								if (!error) error = err;
								if (err) destroys.forEach(call);
								if (reading) return;
								destroys.forEach(call);
								callback(error);
							}
						);
					});
					return streams.reduce(pipe);
				}

				module.exports = pipeline;
			},
			{ "../../../errors": 25, "./end-of-stream": 35 },
		],
		37: [
			function (require, module, exports) {
				"use strict";

				var ERR_INVALID_OPT_VALUE =
					require("../../../errors").codes.ERR_INVALID_OPT_VALUE;

				function highWaterMarkFrom(options, isDuplex, duplexKey) {
					return options.highWaterMark != null
						? options.highWaterMark
						: isDuplex
						? options[duplexKey]
						: null;
				}

				function getHighWaterMark(state, options, duplexKey, isDuplex) {
					var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

					if (hwm != null) {
						if (
							!(isFinite(hwm) && Math.floor(hwm) === hwm) ||
							hwm < 0
						) {
							var name = isDuplex ? duplexKey : "highWaterMark";
							throw new ERR_INVALID_OPT_VALUE(name, hwm);
						}

						return Math.floor(hwm);
					} // Default value

					return state.objectMode ? 16 : 16 * 1024;
				}

				module.exports = {
					getHighWaterMark: getHighWaterMark,
				};
			},
			{ "../../../errors": 25 },
		],
		38: [
			function (require, module, exports) {
				module.exports = require("events").EventEmitter;
			},
			{ events: "events" },
		],
		39: [
			function (require, module, exports) {
				exports = module.exports = require("./lib/_stream_readable.js");
				exports.Stream = exports;
				exports.Readable = exports;
				exports.Writable = require("./lib/_stream_writable.js");
				exports.Duplex = require("./lib/_stream_duplex.js");
				exports.Transform = require("./lib/_stream_transform.js");
				exports.PassThrough = require("./lib/_stream_passthrough.js");
				exports.finished = require("./lib/internal/streams/end-of-stream.js");
				exports.pipeline = require("./lib/internal/streams/pipeline.js");
			},
			{
				"./lib/_stream_duplex.js": 27,
				"./lib/_stream_passthrough.js": 28,
				"./lib/_stream_readable.js": 29,
				"./lib/_stream_transform.js": 30,
				"./lib/_stream_writable.js": 31,
				"./lib/internal/streams/end-of-stream.js": 35,
				"./lib/internal/streams/pipeline.js": 36,
			},
		],
		40: [
			function (require, module, exports) {
				(function (process) {
					module.exports = runParallel;

					function runParallel(tasks, cb) {
						var results, pending, keys;
						var isSync = true;

						if (Array.isArray(tasks)) {
							results = [];
							pending = tasks.length;
						} else {
							keys = Object.keys(tasks);
							results = {};
							pending = keys.length;
						}

						function done(err) {
							function end() {
								if (cb) cb(err, results);
								cb = null;
							}
							if (isSync) process.nextTick(end);
							else end();
						}

						function each(i, err, result) {
							results[i] = result;
							if (--pending === 0 || err) {
								done(err);
							}
						}

						if (!pending) {
							// empty
							done(null);
						} else if (keys) {
							// object
							keys.forEach(function (key) {
								tasks[key](function (err, result) {
									each(key, err, result);
								});
							});
						} else {
							// array
							tasks.forEach(function (task, i) {
								task(function (err, result) {
									each(i, err, result);
								});
							});
						}

						isSync = false;
					}
				}).call(this, require("_process"));
			},
			{ _process: 23 },
		],
		41: [
			function (require, module, exports) {
				/* eslint-disable node/no-deprecated-api */
				var buffer = require("buffer");
				var Buffer = buffer.Buffer;

				// alternative to using Object.keys for old browsers
				function copyProps(src, dst) {
					for (var key in src) {
						dst[key] = src[key];
					}
				}
				if (
					Buffer.from &&
					Buffer.alloc &&
					Buffer.allocUnsafe &&
					Buffer.allocUnsafeSlow
				) {
					module.exports = buffer;
				} else {
					// Copy properties from require('buffer')
					copyProps(buffer, exports);
					exports.Buffer = SafeBuffer;
				}

				function SafeBuffer(arg, encodingOrOffset, length) {
					return Buffer(arg, encodingOrOffset, length);
				}

				SafeBuffer.prototype = Object.create(Buffer.prototype);

				// Copy static methods from Buffer
				copyProps(Buffer, SafeBuffer);

				SafeBuffer.from = function (arg, encodingOrOffset, length) {
					if (typeof arg === "number") {
						throw new TypeError("Argument must not be a number");
					}
					return Buffer(arg, encodingOrOffset, length);
				};

				SafeBuffer.alloc = function (size, fill, encoding) {
					if (typeof size !== "number") {
						throw new TypeError("Argument must be a number");
					}
					var buf = Buffer(size);
					if (fill !== undefined) {
						if (typeof encoding === "string") {
							buf.fill(fill, encoding);
						} else {
							buf.fill(fill);
						}
					} else {
						buf.fill(0);
					}
					return buf;
				};

				SafeBuffer.allocUnsafe = function (size) {
					if (typeof size !== "number") {
						throw new TypeError("Argument must be a number");
					}
					return Buffer(size);
				};

				SafeBuffer.allocUnsafeSlow = function (size) {
					if (typeof size !== "number") {
						throw new TypeError("Argument must be a number");
					}
					return buffer.SlowBuffer(size);
				};
			},
			{ buffer: 16 },
		],
		42: [
			function (require, module, exports) {
				var Buffer = require("safe-buffer").Buffer;

				// prototype class for hash functions
				function Hash(blockSize, finalSize) {
					this._block = Buffer.alloc(blockSize);
					this._finalSize = finalSize;
					this._blockSize = blockSize;
					this._len = 0;
				}

				Hash.prototype.update = function (data, enc) {
					if (typeof data === "string") {
						enc = enc || "utf8";
						data = Buffer.from(data, enc);
					}

					var block = this._block;
					var blockSize = this._blockSize;
					var length = data.length;
					var accum = this._len;

					for (var offset = 0; offset < length; ) {
						var assigned = accum % blockSize;
						var remainder = Math.min(
							length - offset,
							blockSize - assigned
						);

						for (var i = 0; i < remainder; i++) {
							block[assigned + i] = data[offset + i];
						}

						accum += remainder;
						offset += remainder;

						if (accum % blockSize === 0) {
							this._update(block);
						}
					}

					this._len += length;
					return this;
				};

				Hash.prototype.digest = function (enc) {
					var rem = this._len % this._blockSize;

					this._block[rem] = 0x80;

					// zero (rem + 1) trailing bits, where (rem + 1) is the smallest
					// non-negative solution to the equation (length + 1 + (rem + 1)) === finalSize mod blockSize
					this._block.fill(0, rem + 1);

					if (rem >= this._finalSize) {
						this._update(this._block);
						this._block.fill(0);
					}

					var bits = this._len * 8;

					// uint32
					if (bits <= 0xffffffff) {
						this._block.writeUInt32BE(bits, this._blockSize - 4);

						// uint64
					} else {
						var lowBits = (bits & 0xffffffff) >>> 0;
						var highBits = (bits - lowBits) / 0x100000000;

						this._block.writeUInt32BE(
							highBits,
							this._blockSize - 8
						);
						this._block.writeUInt32BE(lowBits, this._blockSize - 4);
					}

					this._update(this._block);
					var hash = this._hash();

					return enc ? hash.toString(enc) : hash;
				};

				Hash.prototype._update = function () {
					throw new Error("_update must be implemented by subclass");
				};

				module.exports = Hash;
			},
			{ "safe-buffer": 41 },
		],
		43: [
			function (require, module, exports) {
				/*
				 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
				 * in FIPS PUB 180-1
				 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
				 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
				 * Distributed under the BSD License
				 * See http://pajhome.org.uk/crypt/md5 for details.
				 */

				var inherits = require("inherits");
				var Hash = require("./hash");
				var Buffer = require("safe-buffer").Buffer;

				var K = [
					0x5a827999,
					0x6ed9eba1,
					0x8f1bbcdc | 0,
					0xca62c1d6 | 0,
				];

				var W = new Array(80);

				function Sha1() {
					this.init();
					this._w = W;

					Hash.call(this, 64, 56);
				}

				inherits(Sha1, Hash);

				Sha1.prototype.init = function () {
					this._a = 0x67452301;
					this._b = 0xefcdab89;
					this._c = 0x98badcfe;
					this._d = 0x10325476;
					this._e = 0xc3d2e1f0;

					return this;
				};

				function rotl1(num) {
					return (num << 1) | (num >>> 31);
				}

				function rotl5(num) {
					return (num << 5) | (num >>> 27);
				}

				function rotl30(num) {
					return (num << 30) | (num >>> 2);
				}

				function ft(s, b, c, d) {
					if (s === 0) return (b & c) | (~b & d);
					if (s === 2) return (b & c) | (b & d) | (c & d);
					return b ^ c ^ d;
				}

				Sha1.prototype._update = function (M) {
					var W = this._w;

					var a = this._a | 0;
					var b = this._b | 0;
					var c = this._c | 0;
					var d = this._d | 0;
					var e = this._e | 0;

					for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4);
					for (; i < 80; ++i)
						W[i] = rotl1(
							W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]
						);

					for (var j = 0; j < 80; ++j) {
						var s = ~~(j / 20);
						var t =
							(rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0;

						e = d;
						d = c;
						c = rotl30(b);
						b = a;
						a = t;
					}

					this._a = (a + this._a) | 0;
					this._b = (b + this._b) | 0;
					this._c = (c + this._c) | 0;
					this._d = (d + this._d) | 0;
					this._e = (e + this._e) | 0;
				};

				Sha1.prototype._hash = function () {
					var H = Buffer.allocUnsafe(20);

					H.writeInt32BE(this._a | 0, 0);
					H.writeInt32BE(this._b | 0, 4);
					H.writeInt32BE(this._c | 0, 8);
					H.writeInt32BE(this._d | 0, 12);
					H.writeInt32BE(this._e | 0, 16);

					return H;
				};

				module.exports = Sha1;
			},
			{ "./hash": 42, inherits: 20, "safe-buffer": 41 },
		],
		44: [
			function (require, module, exports) {
				(function (Buffer) {
					module.exports = Peer;

					var debug = require("debug")("simple-peer");
					var getBrowserRTC = require("get-browser-rtc");
					var inherits = require("inherits");
					var randombytes = require("randombytes");
					var stream = require("readable-stream");

					var MAX_BUFFERED_AMOUNT = 64 * 1024;
					var ICECOMPLETE_TIMEOUT = 5 * 1000;
					var CHANNEL_CLOSING_TIMEOUT = 5 * 1000;

					inherits(Peer, stream.Duplex);

					/**
					 * WebRTC peer connection. Same API as node core `net.Socket`, plus a few extra methods.
					 * Duplex stream.
					 * @param {Object} opts
					 */
					function Peer(opts) {
						var self = this;
						if (!(self instanceof Peer)) return new Peer(opts);

						self._id = randombytes(4).toString("hex").slice(0, 7);
						self._debug("new peer %o", opts);

						opts = Object.assign(
							{
								allowHalfOpen: false,
							},
							opts
						);

						stream.Duplex.call(self, opts);

						self.channelName = opts.initiator
							? opts.channelName ||
							  randombytes(20).toString("hex")
							: null;

						self.initiator = opts.initiator || false;
						self.channelConfig =
							opts.channelConfig || Peer.channelConfig;
						self.config = Object.assign(
							{},
							Peer.config,
							opts.config
						);
						self.offerOptions = opts.offerOptions || {};
						self.answerOptions = opts.answerOptions || {};
						self.sdpTransform =
							opts.sdpTransform ||
							function (sdp) {
								return sdp;
							};
						self.streams =
							opts.streams || (opts.stream ? [opts.stream] : []); // support old "stream" option
						self.trickle =
							opts.trickle !== undefined ? opts.trickle : true;
						self.allowHalfTrickle =
							opts.allowHalfTrickle !== undefined
								? opts.allowHalfTrickle
								: false;
						self.iceCompleteTimeout =
							opts.iceCompleteTimeout || ICECOMPLETE_TIMEOUT;

						self.destroyed = false;
						self._connected = false;

						self.remoteAddress = undefined;
						self.remoteFamily = undefined;
						self.remotePort = undefined;
						self.localAddress = undefined;
						self.localFamily = undefined;
						self.localPort = undefined;

						self._wrtc =
							opts.wrtc && typeof opts.wrtc === "object"
								? opts.wrtc
								: getBrowserRTC();

						if (!self._wrtc) {
							if (typeof window === "undefined") {
								throw makeError(
									"No WebRTC support: Specify `opts.wrtc` option in this environment",
									"ERR_WEBRTC_SUPPORT"
								);
							} else {
								throw makeError(
									"No WebRTC support: Not a supported browser",
									"ERR_WEBRTC_SUPPORT"
								);
							}
						}

						self._pcReady = false;
						self._channelReady = false;
						self._iceComplete = false; // ice candidate trickle done (got null candidate)
						self._iceCompleteTimer = null; // send an offer/answer anyway after some timeout
						self._channel = null;
						self._pendingCandidates = [];

						self._isNegotiating = !self.initiator; // is this peer waiting for negotiation to complete?
						self._batchedNegotiation = false; // batch synchronous negotiations
						self._queuedNegotiation = false; // is there a queued negotiation request?
						self._sendersAwaitingStable = [];
						self._senderMap = new Map();
						self._firstStable = true;
						self._closingInterval = null;

						self._remoteTracks = [];
						self._remoteStreams = [];

						self._chunk = null;
						self._cb = null;
						self._interval = null;

						try {
							self._pc = new self._wrtc.RTCPeerConnection(
								self.config
							);
						} catch (err) {
							setTimeout(() => self.destroy(err), 0);
							return;
						}

						// We prefer feature detection whenever possible, but sometimes that's not
						// possible for certain implementations.
						self._isReactNativeWebrtc =
							typeof self._pc._peerConnectionId === "number";

						self._pc.oniceconnectionstatechange = function () {
							self._onIceStateChange();
						};
						self._pc.onicegatheringstatechange = function () {
							self._onIceStateChange();
						};
						self._pc.onsignalingstatechange = function () {
							self._onSignalingStateChange();
						};
						self._pc.onicecandidate = function (event) {
							self._onIceCandidate(event);
						};

						// Other spec events, unused by this implementation:
						// - onconnectionstatechange
						// - onicecandidateerror
						// - onfingerprintfailure
						// - onnegotiationneeded

						if (self.initiator) {
							self._setupData({
								channel: self._pc.createDataChannel(
									self.channelName,
									self.channelConfig
								),
							});
						} else {
							self._pc.ondatachannel = function (event) {
								self._setupData(event);
							};
						}

						if (self.streams) {
							self.streams.forEach(function (stream) {
								self.addStream(stream);
							});
						}
						self._pc.ontrack = function (event) {
							self._onTrack(event);
						};

						if (self.initiator) {
							self._needsNegotiation();
						}

						self._onFinishBound = function () {
							self._onFinish();
						};
						self.once("finish", self._onFinishBound);
					}

					Peer.WEBRTC_SUPPORT = !!getBrowserRTC();

					/**
					 * Expose peer and data channel config for overriding all Peer
					 * instances. Otherwise, just set opts.config or opts.channelConfig
					 * when constructing a Peer.
					 */
					Peer.config = {
						iceServers: [
							{
								urls: "stun:stun.l.google.com:19302",
							},
							{
								urls: "stun:global.stun.twilio.com:3478?transport=udp",
							},
						],
						sdpSemantics: "unified-plan",
					};
					Peer.channelConfig = {};

					Object.defineProperty(Peer.prototype, "bufferSize", {
						get: function () {
							var self = this;
							return (
								(self._channel &&
									self._channel.bufferedAmount) ||
								0
							);
						},
					});

					// HACK: it's possible channel.readyState is "closing" before peer.destroy() fires
					// https://bugs.chromium.org/p/chromium/issues/detail?id=882743
					Object.defineProperty(Peer.prototype, "connected", {
						get: function () {
							var self = this;
							return (
								self._connected &&
								self._channel.readyState === "open"
							);
						},
					});

					Peer.prototype.address = function () {
						var self = this;
						return {
							port: self.localPort,
							family: self.localFamily,
							address: self.localAddress,
						};
					};

					Peer.prototype.signal = function (data) {
						var self = this;
						if (self.destroyed)
							throw makeError(
								"cannot signal after peer is destroyed",
								"ERR_SIGNALING"
							);
						if (typeof data === "string") {
							try {
								data = JSON.parse(data);
							} catch (err) {
								data = {};
							}
						}
						self._debug("signal()");

						if (data.renegotiate && self.initiator) {
							self._debug("got request to renegotiate");
							self._needsNegotiation();
						}
						if (data.transceiverRequest && self.initiator) {
							self._debug("got request for transceiver");
							self.addTransceiver(
								data.transceiverRequest.kind,
								data.transceiverRequest.init
							);
						}
						if (data.candidate) {
							if (
								self._pc.localDescription &&
								self._pc.localDescription.type &&
								self._pc.remoteDescription &&
								self._pc.remoteDescription.type
							) {
								self._addIceCandidate(data.candidate);
							} else {
								self._pendingCandidates.push(data.candidate);
							}
						}
						if (data.sdp) {
							self._pc
								.setRemoteDescription(
									new self._wrtc.RTCSessionDescription(data)
								)
								.then(function () {
									if (self.destroyed) return;

									self._pendingCandidates.forEach(function (
										candidate
									) {
										self._addIceCandidate(candidate);
									});
									self._pendingCandidates = [];

									if (
										self._pc.remoteDescription.type ===
										"offer"
									)
										self._createAnswer();
								})
								.catch(function (err) {
									self.destroy(
										makeError(
											err,
											"ERR_SET_REMOTE_DESCRIPTION"
										)
									);
								});
						}
						if (
							!data.sdp &&
							!data.candidate &&
							!data.renegotiate &&
							!data.transceiverRequest
						) {
							self.destroy(
								makeError(
									"signal() called with invalid signal data",
									"ERR_SIGNALING"
								)
							);
						}
					};

					Peer.prototype._addIceCandidate = function (candidate) {
						var self = this;
						var iceCandidateObj = new self._wrtc.RTCIceCandidate(
							candidate
						);
						self._pc
							.addIceCandidate(iceCandidateObj)
							.catch(function (err) {
								if (
									!iceCandidateObj.address ||
									iceCandidateObj.address.endsWith(".local")
								) {
									warn("Ignoring unsupported ICE candidate.");
								} else {
									self.destroy(
										makeError(err, "ERR_ADD_ICE_CANDIDATE")
									);
								}
							});
					};

					/**
					 * Send text/binary data to the remote peer.
					 * @param {ArrayBufferView|ArrayBuffer|Buffer|string|Blob} chunk
					 */
					Peer.prototype.send = function (chunk) {
						var self = this;
						self._channel.send(chunk);
					};

					/**
					 * Add a Transceiver to the connection.
					 * @param {String} kind
					 * @param {Object} init
					 */
					Peer.prototype.addTransceiver = function (kind, init) {
						var self = this;

						self._debug("addTransceiver()");

						if (self.initiator) {
							try {
								self._pc.addTransceiver(kind, init);
								self._needsNegotiation();
							} catch (err) {
								self.destroy(err);
							}
						} else {
							self.emit("signal", {
								// request initiator to renegotiate
								transceiverRequest: { kind, init },
							});
						}
					};

					/**
					 * Add a MediaStream to the connection.
					 * @param {MediaStream} stream
					 */
					Peer.prototype.addStream = function (stream) {
						var self = this;

						self._debug("addStream()");

						stream.getTracks().forEach(function (track) {
							self.addTrack(track, stream);
						});
					};

					/**
					 * Add a MediaStreamTrack to the connection.
					 * @param {MediaStreamTrack} track
					 * @param {MediaStream} stream
					 */
					Peer.prototype.addTrack = function (track, stream) {
						var self = this;

						self._debug("addTrack()");

						var submap = self._senderMap.get(track) || new Map(); // nested Maps map [track, stream] to sender
						var sender = submap.get(stream);
						if (!sender) {
							sender = self._pc.addTrack(track, stream);
							submap.set(stream, sender);
							self._senderMap.set(track, submap);
							self._needsNegotiation();
						} else if (sender.removed) {
							self.destroy(
								makeError(
									"Track has been removed. You should enable/disable tracks that you want to re-add.",
									"ERR_SENDER_REMOVED"
								)
							);
						} else {
							self.destroy(
								makeError(
									"Track has already been added to that stream.",
									"ERR_SENDER_ALREADY_ADDED"
								)
							);
						}
					};

					/**
					 * Replace a MediaStreamTrack by another in the connection.
					 * @param {MediaStreamTrack} oldTrack
					 * @param {MediaStreamTrack} newTrack
					 * @param {MediaStream} stream
					 */
					Peer.prototype.replaceTrack = function (
						oldTrack,
						newTrack,
						stream
					) {
						var self = this;

						self._debug("replaceTrack()");

						var submap = self._senderMap.get(oldTrack);
						var sender = submap ? submap.get(stream) : null;
						if (!sender) {
							self.destroy(
								makeError(
									"Cannot replace track that was never added.",
									"ERR_TRACK_NOT_ADDED"
								)
							);
						}
						if (newTrack) self._senderMap.set(newTrack, submap);

						if (sender.replaceTrack != null) {
							sender.replaceTrack(newTrack);
						} else {
							self.destroy(
								makeError(
									"replaceTrack is not supported in this browser",
									"ERR_UNSUPPORTED_REPLACETRACK"
								)
							);
						}
					};

					/**
					 * Remove a MediaStreamTrack from the connection.
					 * @param {MediaStreamTrack} track
					 * @param {MediaStream} stream
					 */
					Peer.prototype.removeTrack = function (track, stream) {
						var self = this;

						self._debug("removeSender()");

						var submap = self._senderMap.get(track);
						var sender = submap ? submap.get(stream) : null;
						if (!sender) {
							self.destroy(
								makeError(
									"Cannot remove track that was never added.",
									"ERR_TRACK_NOT_ADDED"
								)
							);
						}
						try {
							sender.removed = true;
							self._pc.removeTrack(sender);
						} catch (err) {
							if (err.name === "NS_ERROR_UNEXPECTED") {
								self._sendersAwaitingStable.push(sender); // HACK: Firefox must wait until (signalingState === stable) https://bugzilla.mozilla.org/show_bug.cgi?id=1133874
							} else {
								self.destroy(err);
							}
						}
						self._needsNegotiation();
					};

					/**
					 * Remove a MediaStream from the connection.
					 * @param {MediaStream} stream
					 */
					Peer.prototype.removeStream = function (stream) {
						var self = this;

						self._debug("removeSenders()");

						stream.getTracks().forEach(function (track) {
							self.removeTrack(track, stream);
						});
					};

					Peer.prototype._needsNegotiation = function () {
						var self = this;

						self._debug("_needsNegotiation");
						if (self._batchedNegotiation) return; // batch synchronous renegotiations
						self._batchedNegotiation = true;
						setTimeout(function () {
							self._batchedNegotiation = false;
							self._debug("starting batched negotiation");
							self.negotiate();
						}, 0);
					};

					Peer.prototype.negotiate = function () {
						var self = this;

						if (self.initiator) {
							if (self._isNegotiating) {
								self._queuedNegotiation = true;
								self._debug("already negotiating, queueing");
							} else {
								self._debug("start negotiation");
								setTimeout(() => {
									// HACK: Chrome crashes if we immediately call createOffer
									self._createOffer();
								}, 0);
							}
						} else {
							if (!self._isNegotiating) {
								self._debug(
									"requesting negotiation from initiator"
								);
								self.emit("signal", {
									// request initiator to renegotiate
									renegotiate: true,
								});
							}
						}
						self._isNegotiating = true;
					};

					// TODO: Delete this method once readable-stream is updated to contain a default
					// implementation of destroy() that automatically calls _destroy()
					// See: https://github.com/nodejs/readable-stream/issues/283
					Peer.prototype.destroy = function (err) {
						var self = this;
						self._destroy(err, function () {});
					};

					Peer.prototype._destroy = function (err, cb) {
						var self = this;
						if (self.destroyed) return;

						self._debug(
							"destroy (error: %s)",
							err && (err.message || err)
						);

						self.readable = self.writable = false;

						if (!self._readableState.ended) self.push(null);
						if (!self._writableState.finished) self.end();

						self.destroyed = true;
						self._connected = false;
						self._pcReady = false;
						self._channelReady = false;
						self._remoteTracks = null;
						self._remoteStreams = null;
						self._senderMap = null;

						clearInterval(self._closingInterval);
						self._closingInterval = null;

						clearInterval(self._interval);
						self._interval = null;
						self._chunk = null;
						self._cb = null;

						if (self._onFinishBound)
							self.removeListener("finish", self._onFinishBound);
						self._onFinishBound = null;

						if (self._channel) {
							try {
								self._channel.close();
							} catch (err) {}

							self._channel.onmessage = null;
							self._channel.onopen = null;
							self._channel.onclose = null;
							self._channel.onerror = null;
						}
						if (self._pc) {
							try {
								self._pc.close();
							} catch (err) {}

							self._pc.oniceconnectionstatechange = null;
							self._pc.onicegatheringstatechange = null;
							self._pc.onsignalingstatechange = null;
							self._pc.onicecandidate = null;
							self._pc.ontrack = null;
							self._pc.ondatachannel = null;
						}
						self._pc = null;
						self._channel = null;

						if (err) self.emit("error", err);
						self.emit("close");
						cb();
					};

					Peer.prototype._setupData = function (event) {
						var self = this;
						if (!event.channel) {
							// In some situations `pc.createDataChannel()` returns `undefined` (in wrtc),
							// which is invalid behavior. Handle it gracefully.
							// See: https://github.com/feross/simple-peer/issues/163
							return self.destroy(
								makeError(
									"Data channel event is missing `channel` property",
									"ERR_DATA_CHANNEL"
								)
							);
						}

						self._channel = event.channel;
						self._channel.binaryType = "arraybuffer";

						if (
							typeof self._channel.bufferedAmountLowThreshold ===
							"number"
						) {
							self._channel.bufferedAmountLowThreshold =
								MAX_BUFFERED_AMOUNT;
						}

						self.channelName = self._channel.label;

						self._channel.onmessage = function (event) {
							self._onChannelMessage(event);
						};
						self._channel.onbufferedamountlow = function () {
							self._onChannelBufferedAmountLow();
						};
						self._channel.onopen = function () {
							self._onChannelOpen();
						};
						self._channel.onclose = function () {
							self._onChannelClose();
						};
						self._channel.onerror = function (err) {
							self.destroy(makeError(err, "ERR_DATA_CHANNEL"));
						};

						// HACK: Chrome will sometimes get stuck in readyState "closing", let's check for this condition
						// https://bugs.chromium.org/p/chromium/issues/detail?id=882743
						var isClosing = false;
						self._closingInterval = setInterval(function () {
							// No "onclosing" event
							if (
								self._channel &&
								self._channel.readyState === "closing"
							) {
								if (isClosing) self._onChannelClose(); // closing timed out: equivalent to onclose firing
								isClosing = true;
							} else {
								isClosing = false;
							}
						}, CHANNEL_CLOSING_TIMEOUT);
					};

					Peer.prototype._read = function () {};

					Peer.prototype._write = function (chunk, encoding, cb) {
						var self = this;
						if (self.destroyed)
							return cb(
								makeError(
									"cannot write after peer is destroyed",
									"ERR_DATA_CHANNEL"
								)
							);

						if (self._connected) {
							try {
								self.send(chunk);
							} catch (err) {
								return self.destroy(
									makeError(err, "ERR_DATA_CHANNEL")
								);
							}
							if (
								self._channel.bufferedAmount >
								MAX_BUFFERED_AMOUNT
							) {
								self._debug(
									"start backpressure: bufferedAmount %d",
									self._channel.bufferedAmount
								);
								self._cb = cb;
							} else {
								cb(null);
							}
						} else {
							self._debug("write before connect");
							self._chunk = chunk;
							self._cb = cb;
						}
					};

					// When stream finishes writing, close socket. Half open connections are not
					// supported.
					Peer.prototype._onFinish = function () {
						var self = this;
						if (self.destroyed) return;

						if (self._connected) {
							destroySoon();
						} else {
							self.once("connect", destroySoon);
						}

						// Wait a bit before destroying so the socket flushes.
						// TODO: is there a more reliable way to accomplish this?
						function destroySoon() {
							setTimeout(function () {
								self.destroy();
							}, 1000);
						}
					};

					Peer.prototype._startIceCompleteTimeout = function () {
						var self = this;
						if (self.destroyed) return;
						if (self._iceCompleteTimer) return;
						self._debug("started iceComplete timeout");
						self._iceCompleteTimer = setTimeout(function () {
							if (!self._iceComplete) {
								self._iceComplete = true;
								self._debug("iceComplete timeout completed");
								self.emit("iceTimeout");
								self.emit("_iceComplete");
							}
						}, self.iceCompleteTimeout);
					};

					Peer.prototype._createOffer = function () {
						var self = this;
						if (self.destroyed) return;

						self._pc
							.createOffer(self.offerOptions)
							.then(function (offer) {
								if (self.destroyed) return;
								if (!self.trickle && !self.allowHalfTrickle)
									offer.sdp = filterTrickle(offer.sdp);
								offer.sdp = self.sdpTransform(offer.sdp);
								self._pc
									.setLocalDescription(offer)
									.then(onSuccess)
									.catch(onError);

								function onSuccess() {
									self._debug("createOffer success");
									if (self.destroyed) return;
									if (self.trickle || self._iceComplete)
										sendOffer();
									else self.once("_iceComplete", sendOffer); // wait for candidates
								}

								function onError(err) {
									self.destroy(
										makeError(
											err,
											"ERR_SET_LOCAL_DESCRIPTION"
										)
									);
								}

								function sendOffer() {
									if (self.destroyed) return;
									var signal =
										self._pc.localDescription || offer;
									self._debug("signal");
									self.emit("signal", {
										type: signal.type,
										sdp: signal.sdp,
									});
								}
							})
							.catch(function (err) {
								self.destroy(
									makeError(err, "ERR_CREATE_OFFER")
								);
							});
					};

					Peer.prototype._requestMissingTransceivers = function () {
						var self = this;

						if (self._pc.getTransceivers) {
							self._pc
								.getTransceivers()
								.forEach((transceiver) => {
									if (
										!transceiver.mid &&
										transceiver.sender.track &&
										!transceiver.requested
									) {
										transceiver.requested = true; // HACK: Safari returns negotiated transceivers with a null mid
										self.addTransceiver(
											transceiver.sender.track.kind
										);
									}
								});
						}
					};

					Peer.prototype._createAnswer = function () {
						var self = this;
						if (self.destroyed) return;

						self._pc
							.createAnswer(self.answerOptions)
							.then(function (answer) {
								if (self.destroyed) return;
								if (!self.trickle && !self.allowHalfTrickle)
									answer.sdp = filterTrickle(answer.sdp);
								answer.sdp = self.sdpTransform(answer.sdp);
								self._pc
									.setLocalDescription(answer)
									.then(onSuccess)
									.catch(onError);

								function onSuccess() {
									if (self.destroyed) return;
									if (self.trickle || self._iceComplete)
										sendAnswer();
									else self.once("_iceComplete", sendAnswer);
								}

								function onError(err) {
									self.destroy(
										makeError(
											err,
											"ERR_SET_LOCAL_DESCRIPTION"
										)
									);
								}

								function sendAnswer() {
									if (self.destroyed) return;
									var signal =
										self._pc.localDescription || answer;
									self._debug("signal");
									self.emit("signal", {
										type: signal.type,
										sdp: signal.sdp,
									});
									if (!self.initiator)
										self._requestMissingTransceivers();
								}
							})
							.catch(function (err) {
								self.destroy(
									makeError(err, "ERR_CREATE_ANSWER")
								);
							});
					};

					Peer.prototype._onIceStateChange = function () {
						var self = this;
						if (self.destroyed) return;
						var iceConnectionState = self._pc.iceConnectionState;
						var iceGatheringState = self._pc.iceGatheringState;

						self._debug(
							"iceStateChange (connection: %s) (gathering: %s)",
							iceConnectionState,
							iceGatheringState
						);
						self.emit(
							"iceStateChange",
							iceConnectionState,
							iceGatheringState
						);

						if (
							iceConnectionState === "connected" ||
							iceConnectionState === "completed"
						) {
							self._pcReady = true;
							self._maybeReady();
						}
						if (iceConnectionState === "failed") {
							self.destroy(
								makeError(
									"Ice connection failed.",
									"ERR_ICE_CONNECTION_FAILURE"
								)
							);
						}
						if (iceConnectionState === "closed") {
							self.destroy(
								makeError(
									"Ice connection closed.",
									"ERR_ICE_CONNECTION_CLOSED"
								)
							);
						}
					};

					Peer.prototype.getStats = function (cb) {
						var self = this;

						// Promise-based getStats() (standard)
						if (self._pc.getStats.length === 0) {
							self._pc.getStats().then(
								function (res) {
									var reports = [];
									res.forEach(function (report) {
										reports.push(flattenValues(report));
									});
									cb(null, reports);
								},
								function (err) {
									cb(err);
								}
							);

							// Two-parameter callback-based getStats() (deprecated, former standard)
						} else if (self._isReactNativeWebrtc) {
							self._pc.getStats(
								null,
								function (res) {
									var reports = [];
									res.forEach(function (report) {
										reports.push(flattenValues(report));
									});
									cb(null, reports);
								},
								function (err) {
									cb(err);
								}
							);

							// Single-parameter callback-based getStats() (non-standard)
						} else if (self._pc.getStats.length > 0) {
							self._pc.getStats(
								function (res) {
									// If we destroy connection in `connect` callback this code might happen to run when actual connection is already closed
									if (self.destroyed) return;

									var reports = [];
									res.result().forEach(function (result) {
										var report = {};
										result.names().forEach(function (name) {
											report[name] = result.stat(name);
										});
										report.id = result.id;
										report.type = result.type;
										report.timestamp = result.timestamp;
										reports.push(flattenValues(report));
									});
									cb(null, reports);
								},
								function (err) {
									cb(err);
								}
							);

							// Unknown browser, skip getStats() since it's anyone's guess which style of
							// getStats() they implement.
						} else {
							cb(null, []);
						}

						// statreports can come with a value array instead of properties
						function flattenValues(report) {
							if (
								Object.prototype.toString.call(
									report.values
								) === "[object Array]"
							) {
								report.values.forEach(function (value) {
									Object.assign(report, value);
								});
							}
							return report;
						}
					};

					Peer.prototype._maybeReady = function () {
						var self = this;
						self._debug(
							"maybeReady pc %s channel %s",
							self._pcReady,
							self._channelReady
						);
						if (
							self._connected ||
							self._connecting ||
							!self._pcReady ||
							!self._channelReady
						)
							return;

						self._connecting = true;

						// HACK: We can't rely on order here, for details see https://github.com/js-platform/node-webrtc/issues/339
						function findCandidatePair() {
							if (self.destroyed) return;

							self.getStats(function (err, items) {
								if (self.destroyed) return;

								// Treat getStats error as non-fatal. It's not essential.
								if (err) items = [];

								var remoteCandidates = {};
								var localCandidates = {};
								var candidatePairs = {};
								var foundSelectedCandidatePair = false;

								items.forEach(function (item) {
									// TODO: Once all browsers support the hyphenated stats report types, remove
									// the non-hypenated ones
									if (
										item.type === "remotecandidate" ||
										item.type === "remote-candidate"
									) {
										remoteCandidates[item.id] = item;
									}
									if (
										item.type === "localcandidate" ||
										item.type === "local-candidate"
									) {
										localCandidates[item.id] = item;
									}
									if (
										item.type === "candidatepair" ||
										item.type === "candidate-pair"
									) {
										candidatePairs[item.id] = item;
									}
								});

								items.forEach(function (item) {
									// Spec-compliant
									if (
										item.type === "transport" &&
										item.selectedCandidatePairId
									) {
										setSelectedCandidatePair(
											candidatePairs[
												item.selectedCandidatePairId
											]
										);
									}

									// Old implementations
									if (
										(item.type === "googCandidatePair" &&
											item.googActiveConnection ===
												"true") ||
										((item.type === "candidatepair" ||
											item.type === "candidate-pair") &&
											item.selected)
									) {
										setSelectedCandidatePair(item);
									}
								});

								function setSelectedCandidatePair(
									selectedCandidatePair
								) {
									foundSelectedCandidatePair = true;

									var local =
										localCandidates[
											selectedCandidatePair
												.localCandidateId
										];

									if (local && (local.ip || local.address)) {
										// Spec
										self.localAddress =
											local.ip || local.address;
										self.localPort = Number(local.port);
									} else if (local && local.ipAddress) {
										// Firefox
										self.localAddress = local.ipAddress;
										self.localPort = Number(
											local.portNumber
										);
									} else if (
										typeof selectedCandidatePair.googLocalAddress ===
										"string"
									) {
										// TODO: remove this once Chrome 58 is released
										local =
											selectedCandidatePair.googLocalAddress.split(
												":"
											);
										self.localAddress = local[0];
										self.localPort = Number(local[1]);
									}
									if (self.localAddress) {
										self.localFamily =
											self.localAddress.includes(":")
												? "IPv6"
												: "IPv4";
									}

									var remote =
										remoteCandidates[
											selectedCandidatePair
												.remoteCandidateId
										];

									if (
										remote &&
										(remote.ip || remote.address)
									) {
										// Spec
										self.remoteAddress =
											remote.ip || remote.address;
										self.remotePort = Number(remote.port);
									} else if (remote && remote.ipAddress) {
										// Firefox
										self.remoteAddress = remote.ipAddress;
										self.remotePort = Number(
											remote.portNumber
										);
									} else if (
										typeof selectedCandidatePair.googRemoteAddress ===
										"string"
									) {
										// TODO: remove this once Chrome 58 is released
										remote =
											selectedCandidatePair.googRemoteAddress.split(
												":"
											);
										self.remoteAddress = remote[0];
										self.remotePort = Number(remote[1]);
									}
									if (self.remoteAddress) {
										self.remoteFamily =
											self.remoteAddress.includes(":")
												? "IPv6"
												: "IPv4";
									}

									self._debug(
										"connect local: %s:%s remote: %s:%s",
										self.localAddress,
										self.localPort,
										self.remoteAddress,
										self.remotePort
									);
								}

								// Ignore candidate pair selection in browsers like Safari 11 that do not have any local or remote candidates
								// But wait until at least 1 candidate pair is available
								if (
									!foundSelectedCandidatePair &&
									(!Object.keys(candidatePairs).length ||
										Object.keys(localCandidates).length)
								) {
									setTimeout(findCandidatePair, 100);
									return;
								} else {
									self._connecting = false;
									self._connected = true;
								}

								if (self._chunk) {
									try {
										self.send(self._chunk);
									} catch (err) {
										return self.destroy(
											makeError(err, "ERR_DATA_CHANNEL")
										);
									}
									self._chunk = null;
									self._debug(
										'sent chunk from "write before connect"'
									);

									var cb = self._cb;
									self._cb = null;
									cb(null);
								}

								// If `bufferedAmountLowThreshold` and 'onbufferedamountlow' are unsupported,
								// fallback to using setInterval to implement backpressure.
								if (
									typeof self._channel
										.bufferedAmountLowThreshold !== "number"
								) {
									self._interval = setInterval(function () {
										self._onInterval();
									}, 150);
									if (self._interval.unref)
										self._interval.unref();
								}

								self._debug("connect");
								self.emit("connect");
							});
						}
						findCandidatePair();
					};

					Peer.prototype._onInterval = function () {
						var self = this;
						if (
							!self._cb ||
							!self._channel ||
							self._channel.bufferedAmount > MAX_BUFFERED_AMOUNT
						) {
							return;
						}
						self._onChannelBufferedAmountLow();
					};

					Peer.prototype._onSignalingStateChange = function () {
						var self = this;
						if (self.destroyed) return;

						if (
							self._pc.signalingState === "stable" &&
							!self._firstStable
						) {
							self._isNegotiating = false;

							// HACK: Firefox doesn't yet support removing tracks when signalingState !== 'stable'
							self._debug(
								"flushing sender queue",
								self._sendersAwaitingStable
							);
							self._sendersAwaitingStable.forEach(function (
								sender
							) {
								self._pc.removeTrack(sender);
								self._queuedNegotiation = true;
							});
							self._sendersAwaitingStable = [];

							if (self._queuedNegotiation) {
								self._debug("flushing negotiation queue");
								self._queuedNegotiation = false;
								self._needsNegotiation(); // negotiate again
							}

							self._debug("negotiate");
							self.emit("negotiate");
						}
						self._firstStable = false;

						self._debug(
							"signalingStateChange %s",
							self._pc.signalingState
						);
						self.emit(
							"signalingStateChange",
							self._pc.signalingState
						);
					};

					Peer.prototype._onIceCandidate = function (event) {
						var self = this;
						if (self.destroyed) return;
						if (event.candidate && self.trickle) {
							self.emit("signal", {
								candidate: {
									candidate: event.candidate.candidate,
									sdpMLineIndex:
										event.candidate.sdpMLineIndex,
									sdpMid: event.candidate.sdpMid,
								},
							});
						} else if (!event.candidate && !self._iceComplete) {
							self._iceComplete = true;
							self.emit("_iceComplete");
						}
						// as soon as we've received one valid candidate start timeout
						if (event.candidate) {
							self._startIceCompleteTimeout();
						}
					};

					Peer.prototype._onChannelMessage = function (event) {
						var self = this;
						if (self.destroyed) return;
						var data = event.data;
						if (data instanceof ArrayBuffer)
							data = Buffer.from(data);
						self.push(data);
					};

					Peer.prototype._onChannelBufferedAmountLow = function () {
						var self = this;
						if (self.destroyed || !self._cb) return;
						self._debug(
							"ending backpressure: bufferedAmount %d",
							self._channel.bufferedAmount
						);
						var cb = self._cb;
						self._cb = null;
						cb(null);
					};

					Peer.prototype._onChannelOpen = function () {
						var self = this;
						if (self._connected || self.destroyed) return;
						self._debug("on channel open");
						self._channelReady = true;
						self._maybeReady();
					};

					Peer.prototype._onChannelClose = function () {
						var self = this;
						if (self.destroyed) return;
						self._debug("on channel close");
						self.destroy();
					};

					Peer.prototype._onTrack = function (event) {
						var self = this;
						if (self.destroyed) return;

						event.streams.forEach(function (eventStream) {
							self._debug("on track");
							self.emit("track", event.track, eventStream);

							self._remoteTracks.push({
								track: event.track,
								stream: eventStream,
							});

							if (
								self._remoteStreams.some(function (
									remoteStream
								) {
									return remoteStream.id === eventStream.id;
								})
							)
								return; // Only fire one 'stream' event, even though there may be multiple tracks per stream

							self._remoteStreams.push(eventStream);
							setTimeout(function () {
								self.emit("stream", eventStream); // ensure all tracks have been added
							}, 0);
						});
					};

					Peer.prototype._debug = function () {
						var self = this;
						var args = [].slice.call(arguments);
						args[0] = "[" + self._id + "] " + args[0];
						debug.apply(null, args);
					};

					// HACK: Filter trickle lines when trickle is disabled #354
					function filterTrickle(sdp) {
						return sdp.replace(/a=ice-options:trickle\s\n/g, "");
					}

					function makeError(message, code) {
						var err = new Error(message);
						err.code = code;
						return err;
					}

					function warn(message) {
						console.warn(message);
					}
				}).call(this, require("buffer").Buffer);
			},
			{
				buffer: 16,
				debug: "debug",
				"get-browser-rtc": 18,
				inherits: 20,
				randombytes: 24,
				"readable-stream": 39,
			},
		],
		45: [
			function (require, module, exports) {
				(function (process, Buffer) {
					/* global WebSocket, DOMException */

					const debug = require("debug")("simple-websocket");
					const randombytes = require("randombytes");
					const stream = require("readable-stream");
					const ws = require("ws"); // websockets in node - will be empty object in browser

					const _WebSocket =
						typeof ws !== "function" ? WebSocket : ws;

					const MAX_BUFFERED_AMOUNT = 64 * 1024;

					/**
					 * WebSocket. Same API as node core `net.Socket`. Duplex stream.
					 * @param {Object} opts
					 * @param {string=} opts.url websocket server url
					 * @param {string=} opts.socket raw websocket instance to wrap
					 */
					class Socket extends stream.Duplex {
						constructor(opts = {}) {
							// Support simple usage: `new Socket(url)`
							if (typeof opts === "string") {
								opts = { url: opts };
							}

							opts = Object.assign(
								{
									allowHalfOpen: false,
								},
								opts
							);

							super(opts);

							if (opts.url == null && opts.socket == null) {
								throw new Error(
									"Missing required `url` or `socket` option"
								);
							}
							if (opts.url != null && opts.socket != null) {
								throw new Error(
									"Must specify either `url` or `socket` option, not both"
								);
							}

							this._id = randombytes(4)
								.toString("hex")
								.slice(0, 7);
							this._debug("new websocket: %o", opts);

							this.connected = false;
							this.destroyed = false;

							this._chunk = null;
							this._cb = null;
							this._interval = null;

							if (opts.socket) {
								this.url = opts.socket.url;
								this._ws = opts.socket;
								this.connected =
									opts.socket.readyState === _WebSocket.OPEN;
							} else {
								this.url = opts.url;
								try {
									if (typeof ws === "function") {
										// `ws` package accepts options
										this._ws = new _WebSocket(
											opts.url,
											opts
										);
									} else {
										this._ws = new _WebSocket(opts.url);
									}
								} catch (err) {
									process.nextTick(() => this.destroy(err));
									return;
								}
							}

							this._ws.binaryType = "arraybuffer";
							this._ws.onopen = () => {
								this._onOpen();
							};
							this._ws.onmessage = (event) => {
								this._onMessage(event);
							};
							this._ws.onclose = () => {
								this._onClose();
							};
							this._ws.onerror = () => {
								this.destroy(
									new Error("connection error to " + this.url)
								);
							};

							this._onFinishBound = () => {
								this._onFinish();
							};
							this.once("finish", this._onFinishBound);
						}

						/**
						 * Send text/binary data to the WebSocket server.
						 * @param {TypedArrayView|ArrayBuffer|Buffer|string|Blob|Object} chunk
						 */
						send(chunk) {
							this._ws.send(chunk);
						}

						// TODO: Delete this method once readable-stream is updated to contain a default
						// implementation of destroy() that automatically calls _destroy()
						// See: https://github.com/nodejs/readable-stream/issues/283
						destroy(err) {
							this._destroy(err, () => {});
						}

						_destroy(err, cb) {
							if (this.destroyed) return;

							this._debug(
								"destroy (error: %s)",
								err && (err.message || err)
							);

							this.readable = this.writable = false;
							if (!this._readableState.ended) this.push(null);
							if (!this._writableState.finished) this.end();

							this.connected = false;
							this.destroyed = true;

							clearInterval(this._interval);
							this._interval = null;
							this._chunk = null;
							this._cb = null;

							if (this._onFinishBound)
								this.removeListener(
									"finish",
									this._onFinishBound
								);
							this._onFinishBound = null;

							if (this._ws) {
								const ws = this._ws;
								const onClose = () => {
									ws.onclose = null;
								};
								if (ws.readyState === _WebSocket.CLOSED) {
									onClose();
								} else {
									try {
										ws.onclose = onClose;
										ws.close();
									} catch (err) {
										onClose();
									}
								}

								ws.onopen = null;
								ws.onmessage = null;
								ws.onerror = () => {};
							}
							this._ws = null;

							if (err) {
								if (
									typeof DOMException !== "undefined" &&
									err instanceof DOMException
								) {
									// Convert Edge DOMException object to Error object
									const code = err.code;
									err = new Error(err.message);
									err.code = code;
								}
								this.emit("error", err);
							}
							this.emit("close");
							cb();
						}

						_read() {}

						_write(chunk, encoding, cb) {
							if (this.destroyed)
								return cb(
									new Error(
										"cannot write after socket is destroyed"
									)
								);

							if (this.connected) {
								try {
									this.send(chunk);
								} catch (err) {
									return this.destroy(err);
								}
								if (
									typeof ws !== "function" &&
									this._ws.bufferedAmount >
										MAX_BUFFERED_AMOUNT
								) {
									this._debug(
										"start backpressure: bufferedAmount %d",
										this._ws.bufferedAmount
									);
									this._cb = cb;
								} else {
									cb(null);
								}
							} else {
								this._debug("write before connect");
								this._chunk = chunk;
								this._cb = cb;
							}
						}

						// When stream finishes writing, close socket. Half open connections are not
						// supported.
						_onFinish() {
							if (this.destroyed) return;

							// Wait a bit before destroying so the socket flushes.
							// TODO: is there a more reliable way to accomplish this?
							const destroySoon = () => {
								setTimeout(() => this.destroy(), 1000);
							};

							if (this.connected) {
								destroySoon();
							} else {
								this.once("connect", destroySoon);
							}
						}

						_onMessage(event) {
							if (this.destroyed) return;
							let data = event.data;
							if (data instanceof ArrayBuffer)
								data = Buffer.from(data);
							this.push(data);
						}

						_onOpen() {
							if (this.connected || this.destroyed) return;
							this.connected = true;

							if (this._chunk) {
								try {
									this.send(this._chunk);
								} catch (err) {
									return this.destroy(err);
								}
								this._chunk = null;
								this._debug(
									'sent chunk from "write before connect"'
								);

								const cb = this._cb;
								this._cb = null;
								cb(null);
							}

							// Backpressure is not implemented in Node.js. The `ws` module has a buggy
							// `bufferedAmount` property. See: https://github.com/websockets/ws/issues/492
							if (typeof ws !== "function") {
								this._interval = setInterval(
									() => this._onInterval(),
									150
								);
								if (this._interval.unref)
									this._interval.unref();
							}

							this._debug("connect");
							this.emit("connect");
						}

						_onInterval() {
							if (
								!this._cb ||
								!this._ws ||
								this._ws.bufferedAmount > MAX_BUFFERED_AMOUNT
							) {
								return;
							}
							this._debug(
								"ending backpressure: bufferedAmount %d",
								this._ws.bufferedAmount
							);
							const cb = this._cb;
							this._cb = null;
							cb(null);
						}

						_onClose() {
							if (this.destroyed) return;
							this._debug("on close");
							this.destroy();
						}

						_debug() {
							const args = [].slice.call(arguments);
							args[0] = "[" + this._id + "] " + args[0];
							debug.apply(null, args);
						}
					}

					Socket.WEBSOCKET_SUPPORT = !!_WebSocket;

					module.exports = Socket;
				}).call(this, require("_process"), require("buffer").Buffer);
			},
			{
				_process: 23,
				buffer: 16,
				debug: "debug",
				randombytes: 24,
				"readable-stream": 39,
				ws: 15,
			},
		],
		46: [
			function (require, module, exports) {
				// Copyright Joyent, Inc. and other Node contributors.
				//
				// Permission is hereby granted, free of charge, to any person obtaining a
				// copy of this software and associated documentation files (the
				// "Software"), to deal in the Software without restriction, including
				// without limitation the rights to use, copy, modify, merge, publish,
				// distribute, sublicense, and/or sell copies of the Software, and to permit
				// persons to whom the Software is furnished to do so, subject to the
				// following conditions:
				//
				// The above copyright notice and this permission notice shall be included
				// in all copies or substantial portions of the Software.
				//
				// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
				// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
				// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
				// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
				// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
				// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
				// USE OR OTHER DEALINGS IN THE SOFTWARE.

				"use strict";

				/*<replacement>*/

				var Buffer = require("safe-buffer").Buffer;
				/*</replacement>*/

				var isEncoding =
					Buffer.isEncoding ||
					function (encoding) {
						encoding = "" + encoding;
						switch (encoding && encoding.toLowerCase()) {
							case "hex":
							case "utf8":
							case "utf-8":
							case "ascii":
							case "binary":
							case "base64":
							case "ucs2":
							case "ucs-2":
							case "utf16le":
							case "utf-16le":
							case "raw":
								return true;
							default:
								return false;
						}
					};

				function _normalizeEncoding(enc) {
					if (!enc) return "utf8";
					var retried;
					while (true) {
						switch (enc) {
							case "utf8":
							case "utf-8":
								return "utf8";
							case "ucs2":
							case "ucs-2":
							case "utf16le":
							case "utf-16le":
								return "utf16le";
							case "latin1":
							case "binary":
								return "latin1";
							case "base64":
							case "ascii":
							case "hex":
								return enc;
							default:
								if (retried) return; // undefined
								enc = ("" + enc).toLowerCase();
								retried = true;
						}
					}
				}

				// Do not cache `Buffer.isEncoding` when checking encoding names as some
				// modules monkey-patch it to support additional encodings
				function normalizeEncoding(enc) {
					var nenc = _normalizeEncoding(enc);
					if (
						typeof nenc !== "string" &&
						(Buffer.isEncoding === isEncoding || !isEncoding(enc))
					)
						throw new Error("Unknown encoding: " + enc);
					return nenc || enc;
				}

				// StringDecoder provides an interface for efficiently splitting a series of
				// buffers into a series of JS strings without breaking apart multi-byte
				// characters.
				exports.StringDecoder = StringDecoder;
				function StringDecoder(encoding) {
					this.encoding = normalizeEncoding(encoding);
					var nb;
					switch (this.encoding) {
						case "utf16le":
							this.text = utf16Text;
							this.end = utf16End;
							nb = 4;
							break;
						case "utf8":
							this.fillLast = utf8FillLast;
							nb = 4;
							break;
						case "base64":
							this.text = base64Text;
							this.end = base64End;
							nb = 3;
							break;
						default:
							this.write = simpleWrite;
							this.end = simpleEnd;
							return;
					}
					this.lastNeed = 0;
					this.lastTotal = 0;
					this.lastChar = Buffer.allocUnsafe(nb);
				}

				StringDecoder.prototype.write = function (buf) {
					if (buf.length === 0) return "";
					var r;
					var i;
					if (this.lastNeed) {
						r = this.fillLast(buf);
						if (r === undefined) return "";
						i = this.lastNeed;
						this.lastNeed = 0;
					} else {
						i = 0;
					}
					if (i < buf.length)
						return r ? r + this.text(buf, i) : this.text(buf, i);
					return r || "";
				};

				StringDecoder.prototype.end = utf8End;

				// Returns only complete characters in a Buffer
				StringDecoder.prototype.text = utf8Text;

				// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
				StringDecoder.prototype.fillLast = function (buf) {
					if (this.lastNeed <= buf.length) {
						buf.copy(
							this.lastChar,
							this.lastTotal - this.lastNeed,
							0,
							this.lastNeed
						);
						return this.lastChar.toString(
							this.encoding,
							0,
							this.lastTotal
						);
					}
					buf.copy(
						this.lastChar,
						this.lastTotal - this.lastNeed,
						0,
						buf.length
					);
					this.lastNeed -= buf.length;
				};

				// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
				// continuation byte. If an invalid byte is detected, -2 is returned.
				function utf8CheckByte(byte) {
					if (byte <= 0x7f) return 0;
					else if (byte >> 5 === 0x06) return 2;
					else if (byte >> 4 === 0x0e) return 3;
					else if (byte >> 3 === 0x1e) return 4;
					return byte >> 6 === 0x02 ? -1 : -2;
				}

				// Checks at most 3 bytes at the end of a Buffer in order to detect an
				// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
				// needed to complete the UTF-8 character (if applicable) are returned.
				function utf8CheckIncomplete(self, buf, i) {
					var j = buf.length - 1;
					if (j < i) return 0;
					var nb = utf8CheckByte(buf[j]);
					if (nb >= 0) {
						if (nb > 0) self.lastNeed = nb - 1;
						return nb;
					}
					if (--j < i || nb === -2) return 0;
					nb = utf8CheckByte(buf[j]);
					if (nb >= 0) {
						if (nb > 0) self.lastNeed = nb - 2;
						return nb;
					}
					if (--j < i || nb === -2) return 0;
					nb = utf8CheckByte(buf[j]);
					if (nb >= 0) {
						if (nb > 0) {
							if (nb === 2) nb = 0;
							else self.lastNeed = nb - 3;
						}
						return nb;
					}
					return 0;
				}

				// Validates as many continuation bytes for a multi-byte UTF-8 character as
				// needed or are available. If we see a non-continuation byte where we expect
				// one, we "replace" the validated continuation bytes we've seen so far with
				// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
				// behavior. The continuation byte check is included three times in the case
				// where all of the continuation bytes for a character exist in the same buffer.
				// It is also done this way as a slight performance increase instead of using a
				// loop.
				function utf8CheckExtraBytes(self, buf, p) {
					if ((buf[0] & 0xc0) !== 0x80) {
						self.lastNeed = 0;
						return "\ufffd";
					}
					if (self.lastNeed > 1 && buf.length > 1) {
						if ((buf[1] & 0xc0) !== 0x80) {
							self.lastNeed = 1;
							return "\ufffd";
						}
						if (self.lastNeed > 2 && buf.length > 2) {
							if ((buf[2] & 0xc0) !== 0x80) {
								self.lastNeed = 2;
								return "\ufffd";
							}
						}
					}
				}

				// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
				function utf8FillLast(buf) {
					var p = this.lastTotal - this.lastNeed;
					var r = utf8CheckExtraBytes(this, buf, p);
					if (r !== undefined) return r;
					if (this.lastNeed <= buf.length) {
						buf.copy(this.lastChar, p, 0, this.lastNeed);
						return this.lastChar.toString(
							this.encoding,
							0,
							this.lastTotal
						);
					}
					buf.copy(this.lastChar, p, 0, buf.length);
					this.lastNeed -= buf.length;
				}

				// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
				// partial character, the character's bytes are buffered until the required
				// number of bytes are available.
				function utf8Text(buf, i) {
					var total = utf8CheckIncomplete(this, buf, i);
					if (!this.lastNeed) return buf.toString("utf8", i);
					this.lastTotal = total;
					var end = buf.length - (total - this.lastNeed);
					buf.copy(this.lastChar, 0, end);
					return buf.toString("utf8", i, end);
				}

				// For UTF-8, a replacement character is added when ending on a partial
				// character.
				function utf8End(buf) {
					var r = buf && buf.length ? this.write(buf) : "";
					if (this.lastNeed) return r + "\ufffd";
					return r;
				}

				// UTF-16LE typically needs two bytes per character, but even if we have an even
				// number of bytes available, we need to check if we end on a leading/high
				// surrogate. In that case, we need to wait for the next two bytes in order to
				// decode the last character properly.
				function utf16Text(buf, i) {
					if ((buf.length - i) % 2 === 0) {
						var r = buf.toString("utf16le", i);
						if (r) {
							var c = r.charCodeAt(r.length - 1);
							if (c >= 0xd800 && c <= 0xdbff) {
								this.lastNeed = 2;
								this.lastTotal = 4;
								this.lastChar[0] = buf[buf.length - 2];
								this.lastChar[1] = buf[buf.length - 1];
								return r.slice(0, -1);
							}
						}
						return r;
					}
					this.lastNeed = 1;
					this.lastTotal = 2;
					this.lastChar[0] = buf[buf.length - 1];
					return buf.toString("utf16le", i, buf.length - 1);
				}

				// For UTF-16LE we do not explicitly append special replacement characters if we
				// end on a partial character, we simply let v8 handle that.
				function utf16End(buf) {
					var r = buf && buf.length ? this.write(buf) : "";
					if (this.lastNeed) {
						var end = this.lastTotal - this.lastNeed;
						return r + this.lastChar.toString("utf16le", 0, end);
					}
					return r;
				}

				function base64Text(buf, i) {
					var n = (buf.length - i) % 3;
					if (n === 0) return buf.toString("base64", i);
					this.lastNeed = 3 - n;
					this.lastTotal = 3;
					if (n === 1) {
						this.lastChar[0] = buf[buf.length - 1];
					} else {
						this.lastChar[0] = buf[buf.length - 2];
						this.lastChar[1] = buf[buf.length - 1];
					}
					return buf.toString("base64", i, buf.length - n);
				}

				function base64End(buf) {
					var r = buf && buf.length ? this.write(buf) : "";
					if (this.lastNeed)
						return (
							r +
							this.lastChar.toString(
								"base64",
								0,
								3 - this.lastNeed
							)
						);
					return r;
				}

				// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
				function simpleWrite(buf) {
					return buf.toString(this.encoding);
				}

				function simpleEnd(buf) {
					return buf && buf.length ? this.write(buf) : "";
				}
			},
			{ "safe-buffer": 41 },
		],
		47: [
			function (require, module, exports) {
				"use strict";

				function unique_pred(list, compare) {
					var ptr = 1,
						len = list.length,
						a = list[0],
						b = list[0];
					for (var i = 1; i < len; ++i) {
						b = a;
						a = list[i];
						if (compare(a, b)) {
							if (i === ptr) {
								ptr++;
								continue;
							}
							list[ptr++] = a;
						}
					}
					list.length = ptr;
					return list;
				}

				function unique_eq(list) {
					var ptr = 1,
						len = list.length,
						a = list[0],
						b = list[0];
					for (var i = 1; i < len; ++i, b = a) {
						b = a;
						a = list[i];
						if (a !== b) {
							if (i === ptr) {
								ptr++;
								continue;
							}
							list[ptr++] = a;
						}
					}
					list.length = ptr;
					return list;
				}

				function unique(list, compare, sorted) {
					if (list.length === 0) {
						return list;
					}
					if (compare) {
						if (!sorted) {
							list.sort(compare);
						}
						return unique_pred(list, compare);
					}
					if (!sorted) {
						list.sort();
					}
					return unique_eq(list);
				}

				module.exports = unique;
			},
			{},
		],
		48: [
			function (require, module, exports) {
				(function (global) {
					/**
					 * Module exports.
					 */

					module.exports = deprecate;

					/**
					 * Mark that a method should not be used.
					 * Returns a modified function which warns once by default.
					 *
					 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
					 *
					 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
					 * will throw an Error when invoked.
					 *
					 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
					 * will invoke `console.trace()` instead of `console.error()`.
					 *
					 * @param {Function} fn - the function to deprecate
					 * @param {String} msg - the string to print to the console when `fn` is invoked
					 * @returns {Function} a new "deprecated" version of `fn`
					 * @api public
					 */

					function deprecate(fn, msg) {
						if (config("noDeprecation")) {
							return fn;
						}

						var warned = false;
						function deprecated() {
							if (!warned) {
								if (config("throwDeprecation")) {
									throw new Error(msg);
								} else if (config("traceDeprecation")) {
									console.trace(msg);
								} else {
									console.warn(msg);
								}
								warned = true;
							}
							return fn.apply(this, arguments);
						}

						return deprecated;
					}

					/**
					 * Checks `localStorage` for boolean values for the given `name`.
					 *
					 * @param {String} name
					 * @returns {Boolean}
					 * @api private
					 */

					function config(name) {
						// accessing global.localStorage can trigger a DOMException in sandboxed iframes
						try {
							if (!global.localStorage) return false;
						} catch (_) {
							return false;
						}
						var val = global.localStorage[name];
						if (null == val) return false;
						return String(val).toLowerCase() === "true";
					}
				}).call(
					this,
					typeof global !== "undefined"
						? global
						: typeof self !== "undefined"
						? self
						: typeof window !== "undefined"
						? window
						: {}
				);
			},
			{},
		],
		49: [
			function (require, module, exports) {
				// Returns a wrapper function that returns a wrapped callback
				// The wrapper function should do some stuff, and return a
				// presumably different callback function.
				// This makes sure that own properties are retained, so that
				// decorations and such are not lost along the way.
				module.exports = wrappy;
				function wrappy(fn, cb) {
					if (fn && cb) return wrappy(fn)(cb);

					if (typeof fn !== "function")
						throw new TypeError("need wrapper function");

					Object.keys(fn).forEach(function (k) {
						wrapper[k] = fn[k];
					});

					return wrapper;

					function wrapper() {
						var args = new Array(arguments.length);
						for (var i = 0; i < args.length; i++) {
							args[i] = arguments[i];
						}
						var ret = fn.apply(this, args);
						var cb = args[args.length - 1];
						if (typeof ret === "function" && ret !== cb) {
							Object.keys(cb).forEach(function (k) {
								ret[k] = cb[k];
							});
						}
						return ret;
					}
				}
			},
			{},
		],
		debug: [
			function (require, module, exports) {
				(function (process) {
					/* eslint-env browser */

					/**
					 * This is the web browser implementation of `debug()`.
					 */

					exports.log = log;
					exports.formatArgs = formatArgs;
					exports.save = save;
					exports.load = load;
					exports.useColors = useColors;
					exports.storage = localstorage();

					/**
					 * Colors.
					 */

					exports.colors = [
						"#0000CC",
						"#0000FF",
						"#0033CC",
						"#0033FF",
						"#0066CC",
						"#0066FF",
						"#0099CC",
						"#0099FF",
						"#00CC00",
						"#00CC33",
						"#00CC66",
						"#00CC99",
						"#00CCCC",
						"#00CCFF",
						"#3300CC",
						"#3300FF",
						"#3333CC",
						"#3333FF",
						"#3366CC",
						"#3366FF",
						"#3399CC",
						"#3399FF",
						"#33CC00",
						"#33CC33",
						"#33CC66",
						"#33CC99",
						"#33CCCC",
						"#33CCFF",
						"#6600CC",
						"#6600FF",
						"#6633CC",
						"#6633FF",
						"#66CC00",
						"#66CC33",
						"#9900CC",
						"#9900FF",
						"#9933CC",
						"#9933FF",
						"#99CC00",
						"#99CC33",
						"#CC0000",
						"#CC0033",
						"#CC0066",
						"#CC0099",
						"#CC00CC",
						"#CC00FF",
						"#CC3300",
						"#CC3333",
						"#CC3366",
						"#CC3399",
						"#CC33CC",
						"#CC33FF",
						"#CC6600",
						"#CC6633",
						"#CC9900",
						"#CC9933",
						"#CCCC00",
						"#CCCC33",
						"#FF0000",
						"#FF0033",
						"#FF0066",
						"#FF0099",
						"#FF00CC",
						"#FF00FF",
						"#FF3300",
						"#FF3333",
						"#FF3366",
						"#FF3399",
						"#FF33CC",
						"#FF33FF",
						"#FF6600",
						"#FF6633",
						"#FF9900",
						"#FF9933",
						"#FFCC00",
						"#FFCC33",
					];

					/**
					 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
					 * and the Firebug extension (any Firefox version) are known
					 * to support "%c" CSS customizations.
					 *
					 * TODO: add a `localStorage` variable to explicitly enable/disable colors
					 */

					// eslint-disable-next-line complexity
					function useColors() {
						// NB: In an Electron preload script, document will be defined but not fully
						// initialized. Since we know we're in Chrome, we'll just detect this case
						// explicitly
						if (
							typeof window !== "undefined" &&
							window.process &&
							(window.process.type === "renderer" ||
								window.process.__nwjs)
						) {
							return true;
						}

						// Internet Explorer and Edge do not support colors.
						if (
							typeof navigator !== "undefined" &&
							navigator.userAgent &&
							navigator.userAgent
								.toLowerCase()
								.match(/(edge|trident)\/(\d+)/)
						) {
							return false;
						}

						// Is webkit? http://stackoverflow.com/a/16459606/376773
						// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
						return (
							(typeof document !== "undefined" &&
								document.documentElement &&
								document.documentElement.style &&
								document.documentElement.style
									.WebkitAppearance) ||
							// Is firebug? http://stackoverflow.com/a/398120/376773
							(typeof window !== "undefined" &&
								window.console &&
								(window.console.firebug ||
									(window.console.exception &&
										window.console.table))) ||
							// Is firefox >= v31?
							// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
							(typeof navigator !== "undefined" &&
								navigator.userAgent &&
								navigator.userAgent
									.toLowerCase()
									.match(/firefox\/(\d+)/) &&
								parseInt(RegExp.$1, 10) >= 31) ||
							// Double check webkit in userAgent just in case we are in a worker
							(typeof navigator !== "undefined" &&
								navigator.userAgent &&
								navigator.userAgent
									.toLowerCase()
									.match(/applewebkit\/(\d+)/))
						);
					}

					/**
					 * Colorize log arguments if enabled.
					 *
					 * @api public
					 */

					function formatArgs(args) {
						args[0] =
							(this.useColors ? "%c" : "") +
							this.namespace +
							(this.useColors ? " %c" : " ") +
							args[0] +
							(this.useColors ? "%c " : " ") +
							"+" +
							module.exports.humanize(this.diff);

						if (!this.useColors) {
							return;
						}

						const c = "color: " + this.color;
						args.splice(1, 0, c, "color: inherit");

						// The final "%c" is somewhat tricky, because there could be other
						// arguments passed either before or after the %c, so we need to
						// figure out the correct index to insert the CSS into
						let index = 0;
						let lastC = 0;
						args[0].replace(/%[a-zA-Z%]/g, (match) => {
							if (match === "%%") {
								return;
							}
							index++;
							if (match === "%c") {
								// We only are interested in the *last* %c
								// (the user may have provided their own)
								lastC = index;
							}
						});

						args.splice(lastC, 0, c);
					}

					/**
					 * Invokes `console.log()` when available.
					 * No-op when `console.log` is not a "function".
					 *
					 * @api public
					 */
					function log(...args) {
						// This hackery is required for IE8/9, where
						// the `console.log` function doesn't have 'apply'
						return (
							typeof console === "object" &&
							console.log &&
							console.log(...args)
						);
					}

					/**
					 * Save `namespaces`.
					 *
					 * @param {String} namespaces
					 * @api private
					 */
					function save(namespaces) {
						try {
							if (namespaces) {
								exports.storage.setItem("debug", namespaces);
							} else {
								exports.storage.removeItem("debug");
							}
						} catch (error) {
							// Swallow
							// XXX (@Qix-) should we be logging these?
						}
					}

					/**
					 * Load `namespaces`.
					 *
					 * @return {String} returns the previously persisted debug modes
					 * @api private
					 */
					function load() {
						let r;
						try {
							r = exports.storage.getItem("debug");
						} catch (error) {
							// Swallow
							// XXX (@Qix-) should we be logging these?
						}

						// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
						if (
							!r &&
							typeof process !== "undefined" &&
							"env" in process
						) {
							r = process.env.DEBUG;
						}

						return r;
					}

					/**
					 * Localstorage attempts to return the localstorage.
					 *
					 * This is necessary because safari throws
					 * when a user disables cookies/localstorage
					 * and you attempt to access it.
					 *
					 * @return {LocalStorage}
					 * @api private
					 */

					function localstorage() {
						try {
							// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
							// The Browser also has localStorage in the global context.
							return localStorage;
						} catch (error) {
							// Swallow
							// XXX (@Qix-) should we be logging these?
						}
					}

					module.exports = require("./common")(exports);

					const { formatters } = module.exports;

					/**
					 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
					 */

					formatters.j = function (v) {
						try {
							return JSON.stringify(v);
						} catch (error) {
							return (
								"[UnexpectedJSONParseError]: " + error.message
							);
						}
					};
				}).call(this, require("_process"));
			},
			{ "./common": 17, _process: 23 },
		],
		events: [
			function (require, module, exports) {
				// Copyright Joyent, Inc. and other Node contributors.
				//
				// Permission is hereby granted, free of charge, to any person obtaining a
				// copy of this software and associated documentation files (the
				// "Software"), to deal in the Software without restriction, including
				// without limitation the rights to use, copy, modify, merge, publish,
				// distribute, sublicense, and/or sell copies of the Software, and to permit
				// persons to whom the Software is furnished to do so, subject to the
				// following conditions:
				//
				// The above copyright notice and this permission notice shall be included
				// in all copies or substantial portions of the Software.
				//
				// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
				// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
				// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
				// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
				// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
				// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
				// USE OR OTHER DEALINGS IN THE SOFTWARE.

				var objectCreate = Object.create || objectCreatePolyfill;
				var objectKeys = Object.keys || objectKeysPolyfill;
				var bind = Function.prototype.bind || functionBindPolyfill;

				function EventEmitter() {
					if (
						!this._events ||
						!Object.prototype.hasOwnProperty.call(this, "_events")
					) {
						this._events = objectCreate(null);
						this._eventsCount = 0;
					}

					this._maxListeners = this._maxListeners || undefined;
				}
				module.exports = EventEmitter;

				// Backwards-compat with node 0.10.x
				EventEmitter.EventEmitter = EventEmitter;

				EventEmitter.prototype._events = undefined;
				EventEmitter.prototype._maxListeners = undefined;

				// By default EventEmitters will print a warning if more than 10 listeners are
				// added to it. This is a useful default which helps finding memory leaks.
				var defaultMaxListeners = 10;

				var hasDefineProperty;
				try {
					var o = {};
					if (Object.defineProperty)
						Object.defineProperty(o, "x", { value: 0 });
					hasDefineProperty = o.x === 0;
				} catch (err) {
					hasDefineProperty = false;
				}
				if (hasDefineProperty) {
					Object.defineProperty(EventEmitter, "defaultMaxListeners", {
						enumerable: true,
						get: function () {
							return defaultMaxListeners;
						},
						set: function (arg) {
							// check whether the input is a positive number (whose value is zero or
							// greater and not a NaN).
							if (
								typeof arg !== "number" ||
								arg < 0 ||
								arg !== arg
							)
								throw new TypeError(
									'"defaultMaxListeners" must be a positive number'
								);
							defaultMaxListeners = arg;
						},
					});
				} else {
					EventEmitter.defaultMaxListeners = defaultMaxListeners;
				}

				// Obviously not all Emitters should be limited to 10. This function allows
				// that to be increased. Set to zero for unlimited.
				EventEmitter.prototype.setMaxListeners =
					function setMaxListeners(n) {
						if (typeof n !== "number" || n < 0 || isNaN(n))
							throw new TypeError(
								'"n" argument must be a positive number'
							);
						this._maxListeners = n;
						return this;
					};

				function $getMaxListeners(that) {
					if (that._maxListeners === undefined)
						return EventEmitter.defaultMaxListeners;
					return that._maxListeners;
				}

				EventEmitter.prototype.getMaxListeners =
					function getMaxListeners() {
						return $getMaxListeners(this);
					};

				// These standalone emit* functions are used to optimize calling of event
				// handlers for fast cases because emit() itself often has a variable number of
				// arguments and can be deoptimized because of that. These functions always have
				// the same number of arguments and thus do not get deoptimized, so the code
				// inside them can execute faster.
				function emitNone(handler, isFn, self) {
					if (isFn) handler.call(self);
					else {
						var len = handler.length;
						var listeners = arrayClone(handler, len);
						for (var i = 0; i < len; ++i) listeners[i].call(self);
					}
				}
				function emitOne(handler, isFn, self, arg1) {
					if (isFn) handler.call(self, arg1);
					else {
						var len = handler.length;
						var listeners = arrayClone(handler, len);
						for (var i = 0; i < len; ++i)
							listeners[i].call(self, arg1);
					}
				}
				function emitTwo(handler, isFn, self, arg1, arg2) {
					if (isFn) handler.call(self, arg1, arg2);
					else {
						var len = handler.length;
						var listeners = arrayClone(handler, len);
						for (var i = 0; i < len; ++i)
							listeners[i].call(self, arg1, arg2);
					}
				}
				function emitThree(handler, isFn, self, arg1, arg2, arg3) {
					if (isFn) handler.call(self, arg1, arg2, arg3);
					else {
						var len = handler.length;
						var listeners = arrayClone(handler, len);
						for (var i = 0; i < len; ++i)
							listeners[i].call(self, arg1, arg2, arg3);
					}
				}

				function emitMany(handler, isFn, self, args) {
					if (isFn) handler.apply(self, args);
					else {
						var len = handler.length;
						var listeners = arrayClone(handler, len);
						for (var i = 0; i < len; ++i)
							listeners[i].apply(self, args);
					}
				}

				EventEmitter.prototype.emit = function emit(type) {
					var er, handler, len, args, i, events;
					var doError = type === "error";

					events = this._events;
					if (events) doError = doError && events.error == null;
					else if (!doError) return false;

					// If there is no 'error' event listener then throw.
					if (doError) {
						if (arguments.length > 1) er = arguments[1];
						if (er instanceof Error) {
							throw er; // Unhandled 'error' event
						} else {
							// At least give some kind of context to the user
							var err = new Error(
								'Unhandled "error" event. (' + er + ")"
							);
							err.context = er;
							throw err;
						}
						return false;
					}

					handler = events[type];

					if (!handler) return false;

					var isFn = typeof handler === "function";
					len = arguments.length;
					switch (len) {
						// fast cases
						case 1:
							emitNone(handler, isFn, this);
							break;
						case 2:
							emitOne(handler, isFn, this, arguments[1]);
							break;
						case 3:
							emitTwo(
								handler,
								isFn,
								this,
								arguments[1],
								arguments[2]
							);
							break;
						case 4:
							emitThree(
								handler,
								isFn,
								this,
								arguments[1],
								arguments[2],
								arguments[3]
							);
							break;
						// slower
						default:
							args = new Array(len - 1);
							for (i = 1; i < len; i++)
								args[i - 1] = arguments[i];
							emitMany(handler, isFn, this, args);
					}

					return true;
				};

				function _addListener(target, type, listener, prepend) {
					var m;
					var events;
					var existing;

					if (typeof listener !== "function")
						throw new TypeError(
							'"listener" argument must be a function'
						);

					events = target._events;
					if (!events) {
						events = target._events = objectCreate(null);
						target._eventsCount = 0;
					} else {
						// To avoid recursion in the case that type === "newListener"! Before
						// adding it to the listeners, first emit "newListener".
						if (events.newListener) {
							target.emit(
								"newListener",
								type,
								listener.listener ? listener.listener : listener
							);

							// Re-assign `events` because a newListener handler could have caused the
							// this._events to be assigned to a new object
							events = target._events;
						}
						existing = events[type];
					}

					if (!existing) {
						// Optimize the case of one listener. Don't need the extra array object.
						existing = events[type] = listener;
						++target._eventsCount;
					} else {
						if (typeof existing === "function") {
							// Adding the second element, need to change to array.
							existing = events[type] = prepend
								? [listener, existing]
								: [existing, listener];
						} else {
							// If we've already got an array, just append.
							if (prepend) {
								existing.unshift(listener);
							} else {
								existing.push(listener);
							}
						}

						// Check for listener leak
						if (!existing.warned) {
							m = $getMaxListeners(target);
							if (m && m > 0 && existing.length > m) {
								existing.warned = true;
								var w = new Error(
									"Possible EventEmitter memory leak detected. " +
										existing.length +
										' "' +
										String(type) +
										'" listeners ' +
										"added. Use emitter.setMaxListeners() to " +
										"increase limit."
								);
								w.name = "MaxListenersExceededWarning";
								w.emitter = target;
								w.type = type;
								w.count = existing.length;
								if (
									typeof console === "object" &&
									console.warn
								) {
									console.warn("%s: %s", w.name, w.message);
								}
							}
						}
					}

					return target;
				}

				EventEmitter.prototype.addListener = function addListener(
					type,
					listener
				) {
					return _addListener(this, type, listener, false);
				};

				EventEmitter.prototype.on = EventEmitter.prototype.addListener;

				EventEmitter.prototype.prependListener =
					function prependListener(type, listener) {
						return _addListener(this, type, listener, true);
					};

				function onceWrapper() {
					if (!this.fired) {
						this.target.removeListener(this.type, this.wrapFn);
						this.fired = true;
						switch (arguments.length) {
							case 0:
								return this.listener.call(this.target);
							case 1:
								return this.listener.call(
									this.target,
									arguments[0]
								);
							case 2:
								return this.listener.call(
									this.target,
									arguments[0],
									arguments[1]
								);
							case 3:
								return this.listener.call(
									this.target,
									arguments[0],
									arguments[1],
									arguments[2]
								);
							default:
								var args = new Array(arguments.length);
								for (var i = 0; i < args.length; ++i)
									args[i] = arguments[i];
								this.listener.apply(this.target, args);
						}
					}
				}

				function _onceWrap(target, type, listener) {
					var state = {
						fired: false,
						wrapFn: undefined,
						target: target,
						type: type,
						listener: listener,
					};
					var wrapped = bind.call(onceWrapper, state);
					wrapped.listener = listener;
					state.wrapFn = wrapped;
					return wrapped;
				}

				EventEmitter.prototype.once = function once(type, listener) {
					if (typeof listener !== "function")
						throw new TypeError(
							'"listener" argument must be a function'
						);
					this.on(type, _onceWrap(this, type, listener));
					return this;
				};

				EventEmitter.prototype.prependOnceListener =
					function prependOnceListener(type, listener) {
						if (typeof listener !== "function")
							throw new TypeError(
								'"listener" argument must be a function'
							);
						this.prependListener(
							type,
							_onceWrap(this, type, listener)
						);
						return this;
					};

				// Emits a 'removeListener' event if and only if the listener was removed.
				EventEmitter.prototype.removeListener = function removeListener(
					type,
					listener
				) {
					var list, events, position, i, originalListener;

					if (typeof listener !== "function")
						throw new TypeError(
							'"listener" argument must be a function'
						);

					events = this._events;
					if (!events) return this;

					list = events[type];
					if (!list) return this;

					if (list === listener || list.listener === listener) {
						if (--this._eventsCount === 0)
							this._events = objectCreate(null);
						else {
							delete events[type];
							if (events.removeListener)
								this.emit(
									"removeListener",
									type,
									list.listener || listener
								);
						}
					} else if (typeof list !== "function") {
						position = -1;

						for (i = list.length - 1; i >= 0; i--) {
							if (
								list[i] === listener ||
								list[i].listener === listener
							) {
								originalListener = list[i].listener;
								position = i;
								break;
							}
						}

						if (position < 0) return this;

						if (position === 0) list.shift();
						else spliceOne(list, position);

						if (list.length === 1) events[type] = list[0];

						if (events.removeListener)
							this.emit(
								"removeListener",
								type,
								originalListener || listener
							);
					}

					return this;
				};

				EventEmitter.prototype.removeAllListeners =
					function removeAllListeners(type) {
						var listeners, events, i;

						events = this._events;
						if (!events) return this;

						// not listening for removeListener, no need to emit
						if (!events.removeListener) {
							if (arguments.length === 0) {
								this._events = objectCreate(null);
								this._eventsCount = 0;
							} else if (events[type]) {
								if (--this._eventsCount === 0)
									this._events = objectCreate(null);
								else delete events[type];
							}
							return this;
						}

						// emit removeListener for all listeners on all events
						if (arguments.length === 0) {
							var keys = objectKeys(events);
							var key;
							for (i = 0; i < keys.length; ++i) {
								key = keys[i];
								if (key === "removeListener") continue;
								this.removeAllListeners(key);
							}
							this.removeAllListeners("removeListener");
							this._events = objectCreate(null);
							this._eventsCount = 0;
							return this;
						}

						listeners = events[type];

						if (typeof listeners === "function") {
							this.removeListener(type, listeners);
						} else if (listeners) {
							// LIFO order
							for (i = listeners.length - 1; i >= 0; i--) {
								this.removeListener(type, listeners[i]);
							}
						}

						return this;
					};

				function _listeners(target, type, unwrap) {
					var events = target._events;

					if (!events) return [];

					var evlistener = events[type];
					if (!evlistener) return [];

					if (typeof evlistener === "function")
						return unwrap
							? [evlistener.listener || evlistener]
							: [evlistener];

					return unwrap
						? unwrapListeners(evlistener)
						: arrayClone(evlistener, evlistener.length);
				}

				EventEmitter.prototype.listeners = function listeners(type) {
					return _listeners(this, type, true);
				};

				EventEmitter.prototype.rawListeners = function rawListeners(
					type
				) {
					return _listeners(this, type, false);
				};

				EventEmitter.listenerCount = function (emitter, type) {
					if (typeof emitter.listenerCount === "function") {
						return emitter.listenerCount(type);
					} else {
						return listenerCount.call(emitter, type);
					}
				};

				EventEmitter.prototype.listenerCount = listenerCount;
				function listenerCount(type) {
					var events = this._events;

					if (events) {
						var evlistener = events[type];

						if (typeof evlistener === "function") {
							return 1;
						} else if (evlistener) {
							return evlistener.length;
						}
					}

					return 0;
				}

				EventEmitter.prototype.eventNames = function eventNames() {
					return this._eventsCount > 0
						? Reflect.ownKeys(this._events)
						: [];
				};

				// About 1.5x faster than the two-arg version of Array#splice().
				function spliceOne(list, index) {
					for (
						var i = index, k = i + 1, n = list.length;
						k < n;
						i += 1, k += 1
					)
						list[i] = list[k];
					list.pop();
				}

				function arrayClone(arr, n) {
					var copy = new Array(n);
					for (var i = 0; i < n; ++i) copy[i] = arr[i];
					return copy;
				}

				function unwrapListeners(arr) {
					var ret = new Array(arr.length);
					for (var i = 0; i < ret.length; ++i) {
						ret[i] = arr[i].listener || arr[i];
					}
					return ret;
				}

				function objectCreatePolyfill(proto) {
					var F = function () {};
					F.prototype = proto;
					return new F();
				}
				function objectKeysPolyfill(obj) {
					var keys = [];
					for (var k in obj)
						if (Object.prototype.hasOwnProperty.call(obj, k)) {
							keys.push(k);
						}
					return k;
				}
				function functionBindPolyfill(context) {
					var fn = this;
					return function () {
						return fn.apply(context, arguments);
					};
				}
			},
			{},
		],
		"p2p-media-loader-core": [
			function (require, module, exports) {
				"use strict";
				/**
				 * @license Apache-2.0
				 * Copyright 2018 Novage LLC.
				 *
				 * Licensed under the Apache License, Version 2.0 (the "License");
				 * you may not use this file except in compliance with the License.
				 * You may obtain a copy of the License at
				 *
				 *     http://www.apache.org/licenses/LICENSE-2.0
				 *
				 * Unless required by applicable law or agreed to in writing, software
				 * distributed under the License is distributed on an "AS IS" BASIS,
				 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
				 * See the License for the specific language governing permissions and
				 * limitations under the License.
				 */
				function __export(m) {
					for (var p in m)
						if (!exports.hasOwnProperty(p)) exports[p] = m[p];
				}
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.version = "0.6.2";
				__export(require("./loader-interface"));
				__export(require("./hybrid-loader"));
			},
			{ "./hybrid-loader": 4, "./loader-interface": 5 },
		],
	},
	{},
	[2]
);
