"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanHtml = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const cleanHtml = (html) => (0, sanitize_html_1.default)(html, {
    allowedTags: sanitize_html_1.default.defaults.allowedTags.concat(["h1", "h2"]),
    allowedAttributes: {
        a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
});
exports.cleanHtml = cleanHtml;
