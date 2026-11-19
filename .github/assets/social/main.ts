import "@fontsource-variable/inter";
import "@fontsource-variable/geist-mono";
import "@pierre/words/styles.css";
import { mount } from "svelte";
import Card from "./Card.svelte";

const variant = new URLSearchParams(location.search).get("variant") ?? "words";
mount(Card, { target: document.getElementById("card")!, props: { variant } });
