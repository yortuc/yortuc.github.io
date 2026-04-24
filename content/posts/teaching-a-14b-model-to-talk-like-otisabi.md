+++
date = '2026-04-22T12:00:00-07:00'
draft = false
title = 'Teaching a 14B Model to Talk Like otisabi: An SFT Style Transfer Experiment'
+++

I wanted to fine-tune a small LLM to write like a specific person. Not a generic "write in a funny tone" — I wanted it to mimic a real writer's voice. I picked [otisabi](https://eksisozluk.com/biri/otisabi), a veteran writer on ekşi sözlük with nearly 14,000 entries and a distinctive style.

For those unfamiliar: ekşi sözlük is Turkey's iconic collaborative dictionary, founded in 1999 — years before Urban Dictionary or Reddit existed. Think of it as a mix of both, but with a culture of sharp wit, irony, and strong personal voices. Writers build followings based on their style, and the best ones are instantly recognizable from a single entry.

Here's what happened across 5 training runs, what I learned, and why this is harder than it sounds.

## The Setup

The pipeline was straightforward:

1. **Scrape** the writer's entries (13,941 total)
2. **Format** them as chat-style training data (topic → entry)
3. **Train** with QLoRA on SageMaker
4. **Deploy** to Ollama for local inference

The scraping was its own adventure — ekşi sözlük sits behind Cloudflare, and user entry pages require authentication. The trick was using `curl_cffi` for TLS impersonation and the `X-Requested-With: XMLHttpRequest` header to hit the AJAX endpoint, which returns entries without auth.

After quality filtering (removing short references, links, and noise), I had **10,723 training examples**. More than enough, I thought.

## Run 1: The Base Model Disaster

**Model:** Qwen2.5-7B (base), **LoRA:** r=16, lr=2e-4

First mistake: I used the *base* model instead of the instruct variant. Base models are trained to complete text, not follow instructions. The chat format in my training data meant nothing to it.

> **Prompt:** "pazartesi sendromu"
>
> Pazartesi sendromu (ang. Sunday scroton), pazartesi gününe gelir ve hikayeleri ile kendi dünyasına kavuşur... Kategori:Müzikler

It tried to write a Wikipedia article and ended with a random category tag. Not what I wanted.

**Lesson:** Always fine-tune the instruct model for chat-style tasks.

## Run 2: Destroying the Model with Learning Rate

**Model:** Qwen2.5-7B-Instruct, **LoRA:** r=16, lr=2e-4

Switched to the instruct model. Same learning rate. This was worse.

> **Prompt:** "pazartesi sendromu"
>
> kaleminin 2315-09-24 tarihli diyalogundan: "neden pazartesinden yarın günler kadar gıcırdayan bir sentromuz var?" "kalemi takas ediyorum. senim için yine kendi sentromu yazacağım."

Invented dates from the year 2315. Made-up words ("sentromuz" instead of "sendrom"). Incoherent dialogue with itself. The high learning rate had destroyed the model's coherence — a textbook case of catastrophic forgetting.

**Lesson:** 2e-4 is fine for base models but way too aggressive for instruct models. Use 5e-6 to 2e-5.

## Run 3: Not Enough Adapter Capacity

**Model:** Qwen2.5-7B-Instruct, **LoRA:** r=16, lr=2e-5

Lowered the learning rate by 10x. Still bad.

> **Prompt:** "istanbul'da yaşamanın zorlukları"
>
> başlıkta istanbular ile başlamış bir entry. istanbullar olursa en güzel sanatsal, sosyal ve bilimsel olayların yer aldığı yer. istanbulların en muhtemelen istanbulları olanlar, istanbulluların en muhtemelen istanbulları olmayacak.

The model was trying but couldn't express what it learned. The problem: I was only training adapters on 2 out of 7 weight matrices per layer (q_proj and v_proj). That's like trying to repaint a house by changing two brushstrokes.

**Lesson:** For style transfer, target all attention and MLP layers. r=16 is too small — use r=32-64.

## Run 4: Finally Coherent

**Model:** Qwen2.5-7B-Instruct, **LoRA:** r=64, all 7 target modules, lr=5e-6, 5% warmup

This time I fixed everything: more target modules, higher rank, lower learning rate, warmup steps, and cleaned the training data (filtered out short references and noise).

Training metrics looked healthy — eval loss dropped from 4.75 to 2.67 with no overfitting.

> **Prompt:** "pazartesi sendromu"
>
> haftanın başı, 3 gün içinde çalışmak gereken tüm işleri bir yerde toplamak ve bununla ilgili düşünmek durumunda kalmanız, 2000-2500 lira gelmesini beklemek gibi 100 bin dolarlık yataktan uyanmaya benzer bir durum.

> **Prompt:** "istanbul'da yaşamanın zorlukları"
>
> yoktur. buna inanmak gerekirse benim için istanbul'un en lezzetli şehrin olduğunu söyleyen yarım milyon da yazarın, "takip edilen" kimselerin, "birisi" de sanırım, (ve öyle olmalı) 1000 kez yinelediğini görebilirim.

Now we're getting somewhere. The "yoktur" (it doesn't exist) opening is a classic ekşi contrarian take. The parenthetical asides feel right. But it's still not *otisabi* — it's "generic ekşi writer."

## Run 5: Scaling Up to 14B

**Model:** Qwen2.5-14B-Instruct, **LoRA:** r=32, all 7 target modules, lr=5e-6

Doubled the model size. Eval loss improved to 2.51 (vs 7B's 2.67).

> **Prompt:** "istanbul'da yaşamanın zorlukları"
>
> istanbul'da yaşamanın birincil zorluğu "yaşamak". kendine, bu konuda başkentten daha çok hak iddia ettiğini bildiği için bu zorlukla mazurlaşan İstanbullu'ya öncelikle kendi kafasına bakmaya ve kendisini bir tür "büyüklük" içinde hissetmeye çalışılması tavsiye edilir.

The wordplay on "yaşamanın zorluğu yaşamak" (the difficulty of living is living) is genuinely clever. But the rest meanders. It learned the *format* of ekşi entries but not the *wit*.

## The Numbers

I ran all training on AWS SageMaker using `ml.g5.2xlarge` instances (NVIDIA A10G, 24GB VRAM, ~$1.50/hr on-demand). The workflow: upload training data to S3, submit a job with a Python script and a HuggingFace container, SageMaker provisions the GPU, downloads the model from HuggingFace, trains, uploads the adapter back to S3, and terminates the instance. Fire and forget.

Some operational lessons along the way: spot instances save 70% but get interrupted mid-training. Max runtime limits kill jobs silently — always set generous limits. And save checkpoints every 250-500 steps, because you *will* lose a run.

The launch script is minimal — SageMaker handles the infrastructure:

```python
from sagemaker.huggingface import HuggingFace

estimator = HuggingFace(
    entry_point="train.py",
    source_dir="./training",
    instance_type="ml.g5.2xlarge",
    instance_count=1,
    transformers_version="4.49",
    pytorch_version="2.5",
    py_version="py311",
    role=role,
    hyperparameters={
        "model_id": "Qwen/Qwen2.5-14B-Instruct",
        "epochs": 1,
        "lr": "5e-6",
    },
    use_spot_instances=False,
    max_run=14400,
)

estimator.fit({"training": "s3://my-bucket/eksi-sft/data/"}, wait=False)
```

And the training script itself uses TRL's `SFTTrainer` with QLoRA — the "Q" stands for quantized. The base model's weights are compressed to 4-bit precision (from 32-bit), shrinking a 14B model from ~28GB to ~8GB so it fits on a single 24GB GPU. The LoRA adapters still train in full precision, so quality loss is minimal. The bigger levers for output quality are model size, learning rate, and training technique — not quantization precision.

```python
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
)

model = AutoModelForCausalLM.from_pretrained(
    model_id, quantization_config=bnb_config, device_map="auto"
)

lora_config = LoraConfig(
    r=32,
    lora_alpha=64,
    lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                     "gate_proj", "up_proj", "down_proj"],
    task_type="CAUSAL_LM",
)

trainer = SFTTrainer(
    model=model,
    args=SFTConfig(
        num_train_epochs=1,
        per_device_train_batch_size=1,
        gradient_accumulation_steps=8,
        learning_rate=5e-6,
        warmup_ratio=0.05,
        bf16=True,
        gradient_checkpointing=True,
        max_seq_length=512,
    ),
    train_dataset=dataset["train"],
    eval_dataset=dataset["validation"],
    peft_config=lora_config,
)

trainer.train()
```

| Run | Model | LoRA Config | LR | Eval Loss | Cost | Result |
|---|---|---|---|---|---|---|
| 1 | 7B base | r=16, 2 modules | 2e-4 | — | ~$3 | ❌ Gibberish |
| 2 | 7B-Instruct | r=16, 2 modules | 2e-4 | — | ~$6 | ❌ Destroyed model |
| 3 | 7B-Instruct | r=16, 2 modules | 2e-5 | — | ~$6 | ❌ Incoherent |
| 4 | 7B-Instruct | r=64, 7 modules | 5e-6 | 2.67 | ~$7 | ✅ Coherent, style emerging |
| 5 | 14B-Instruct | r=32, 7 modules | 5e-6 | 2.51 | ~$8 | ✅ Best, still limited |
| | | | | | **~$32** | |

Most of the $32 was wasted learning what not to do. The two useful runs cost ~$15 combined.

## What I Actually Learned

The technical lessons are useful but unsurprising in hindsight:

| Parameter | What I learned |
|---|---|
| Base vs Instruct | Always use instruct for chat tasks |
| Learning rate | 5e-6 for instruct models, not 2e-4 |
| LoRA targets | All 7 layers, not just q_proj/v_proj |
| LoRA rank | r=32-64 for style transfer |
| Warmup | Essential — 5% prevents early destabilization |
| Checkpoints | Save every 250 steps. Jobs get killed. |

But the deeper lesson is about **what SFT can and can't do.**

SFT is great for teaching a model a new *format* — how to structure outputs, what language to use, how long to write. My model learned all of that. It writes short Turkish entries with informal tone and ekşi conventions.

SFT is bad at teaching *taste* — the subtle patterns that make one writer's entries funny and another's boring. Joke timing, cultural references, the specific way someone sets up a punchline — these are encoded in ways that LoRA adapters on a 7-14B model can't fully capture.

## Where SFT Actually Shines

This experience convinced me that SFT's sweet spot is **constrained output tasks**: generating code in a specific DSL, classification, structured data extraction, format conversion. Tasks where the output space is bounded and you can validate correctness programmatically.

Free-form creative writing in a minority language? That's playing on hard mode. Fun to try, educational to fail at, but not where I'd bet production money.

The pipeline I built — scraping, data formatting, SageMaker training, Ollama deployment — is solid and reusable. I'll apply it next to a DSL generation task where a 7B model should actually excel. Sometimes the most valuable thing you learn from a project is what to try next.

## What's Next

SFT alone got me to "coherent but generic." The next step is **DPO (Direct Preference Optimization)** — generating multiple entries per topic, ranking them by quality, and training the model on preferences. This is the technique that took ChatGPT from "meh" to "good," and it might be what's needed to close the gap between "writes like an ekşi writer" and "writes like *otisabi*."

That'll be part 2.
