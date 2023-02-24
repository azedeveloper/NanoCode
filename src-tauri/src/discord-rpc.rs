use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut client = DiscordIpcClient::new("1075814804998074498")?;

    client.connect()?;
    client.set_activity(activity::Activity::new()
        .state("foo")
        .details("bar")
    )?;
    client.close()?;

    Ok(())
}