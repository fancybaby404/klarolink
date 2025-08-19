import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database-adapter"

export async function POST(request: NextRequest) {
  try {
    console.log("🌱 Seeding task notifications for Business Intelligence and Analytics...")

    // Sample notifications to seed (matching your actual database schema)
    const sampleNotifications = [
      {
        task_id: 1,
        department: 'Business Intelligence and Analytics',
        message: 'New Feedback Received - You have received 3 new feedback submissions today',
        milestone: 1,
        read: false
      },
      {
        task_id: 2,
        department: 'Business Intelligence and Analytics',
        message: 'Form Performance Alert - Your feedback form completion rate has increased by 15%',
        milestone: 1,
        read: false
      },
      {
        task_id: 3,
        department: 'Business Intelligence and Analytics',
        message: 'Weekly Analytics Summary - Your weekly analytics report is ready for review',
        milestone: 1,
        read: true
      },
      {
        task_id: 4,
        department: 'Business Intelligence and Analytics',
        message: 'Customer Satisfaction Milestone - Congratulations! You\'ve reached 100 positive reviews',
        milestone: 1,
        read: false
      },
      {
        task_id: 5,
        department: 'Business Intelligence and Analytics',
        message: 'Form Optimization Suggestion - Consider adding a rating field to improve feedback quality',
        milestone: 1,
        read: false
      }
    ]

    // Check if we're using the real database
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        message: "Using mock database - notifications are already available",
        note: "This endpoint is only needed when using a real database",
        sampleNotifications: sampleNotifications.length
      })
    }

    // Insert notifications into the real database
    const insertedNotifications = []
    
    for (const notification of sampleNotifications) {
      try {
        const query = `
          INSERT INTO task_notifications (
            task_id, department, message, milestone, read
          ) VALUES (
            $1, $2, $3, $4, $5
          )
          ON CONFLICT (task_id) DO UPDATE SET
            department = EXCLUDED.department,
            message = EXCLUDED.message,
            milestone = EXCLUDED.milestone,
            read = EXCLUDED.read
          RETURNING id, task_id, message, department
        `

        const result = await db.query!(query, [
          notification.task_id,
          notification.department,
          notification.message,
          notification.milestone,
          notification.read
        ])
        
        if (result && result.length > 0) {
          insertedNotifications.push(result[0])
          console.log(`✅ Inserted notification: ${notification.message}`)
        }
      } catch (error) {
        console.error(`❌ Failed to insert notification ${notification.task_id}:`, error)
      }
    }

    console.log(`🎉 Successfully seeded ${insertedNotifications.length} notifications`)

    return NextResponse.json({
      message: `Successfully seeded ${insertedNotifications.length} task notifications`,
      category: "Business Intelligence and Analytics",
      insertedNotifications: insertedNotifications,
      next_steps: [
        "Refresh the notification dashboard to see the new notifications",
        "Check the notification bell in the top-left corner",
        "The notifications should now appear when filtering for 'Business Intelligence and Analytics'"
      ]
    })

  } catch (error) {
    console.error("❌ Error seeding notifications:", error)
    return NextResponse.json({ 
      error: "Failed to seed notifications",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
