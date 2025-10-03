import requests

HF_TOKEN = "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"  # 你的 Hugging Face Token

# 候选模型（确认支持 Inference API）
MODELS = [
    "google/flan-t5-base",
    "google/flan-t5-large",
    "tiiuae/falcon-7b-instruct",
    "Writer/palmyra-small"
]

# 实际代码片段：存在明显问题（比如未处理除零错误，缺少类型检查）
CODE_SNIPPET = """
def calculate_average(numbers):
    total = 0
    for n in numbers:
        total += n
    return total / len(numbers)
"""

headers = {"Authorization": f"Bearer {HF_TOKEN}", "Content-Type": "application/json"}

for model in MODELS:
    print(f"\n🔎 Testing model: {model}")
    url = f"https://api-inference.huggingface.co/models/{model}"
    payload = {
        "inputs": (
            "Please review the following Python function and provide feedback "
            "on potential bugs, edge cases, and improvements:\n"
            f"{CODE_SNIPPET}"
        )
    }
    try:
        r = requests.post(url, headers=headers, json=payload, timeout=60)
        if r.status_code == 200:
            print("✅ Review Result:", r.json())
        else:
            print(f"❌ Failed ({r.status_code}):", r.text[:300])
    except Exception as e:
        print("⚠️ Error:", e)