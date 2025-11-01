import replicate

print("Testing ElevenLabs v3 with Grimblewood voice...")

input = {
    "voice": "Grimblewood",
    "prompt": "In the ancient land of Eldoria, where skies shimmered and forests, whispered secrets to the wind, lived a dragon named Zephyros. Not the burn it all down kind, but he was gentle, wise, with eyes like old stars. Even the birds fell silent when he passed."
}

try:
    output = replicate.run(
        "elevenlabs/v3",
        input=input
    )

    # To access the file URL:
    print(f"Audio URL: {output.url()}")

    # To write the file to disk:
    with open("output.mp3", "wb") as file:
        file.write(output.read())

    print("✓ output.mp3 written to disk successfully!")

except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
