import replicate

print("Testing ElevenLabs turbo-v2.5 with Reginald voice...")

input = {
    "voice": "Reginald",
    "prompt": "Richard Paul Astley is an English singer, songwriter, radio DJ and podcaster."
}

try:
    output = replicate.run("elevenlabs/turbo-v2.5", input=input)

    print(f"✓ Success! Audio URL: {output}")

    with open("test_output.mp3", "wb") as file:
        file.write(output)

    print("✓ test_output.mp3 written to disk successfully!")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
