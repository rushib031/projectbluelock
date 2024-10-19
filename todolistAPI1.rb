require 'httparty'
require 'json'
require 'dotenv'
require 'time'

Dotenv.load

module CanvasAPI
  CANVAS_API_BASE_URL = 'https://osu.instructure.com/api/v1'.freeze
  TOKEN = ENV['ACCESS_TOKEN']
  HEADERS = { 'Authorization' => "Bearer #{TOKEN}" }

  TERM_MAP = {
    160 => 'Autumn 2021',
    161 => 'Spring 2022',
    162 => 'Summer 2022',
    163 => 'Autumn 2022',
    164 => 'Spring 2023',
    265 => 'Summer 2023',
    266 => 'Autumn 2023',
    267 => 'Spring 2024',
    268 => 'Summer 2024',
    269 => 'Autumn 2024'
  }

  def self.paginated_get(url)
    results = []
    loop do
      response = HTTParty.get(url, headers: HEADERS)
      if response.success?
        results.concat(JSON.parse(response.body))
        next_url = parse_next_link(response.headers['link'])
        break unless next_url
        url = next_url
      else
        handle_error(response)
        break
      end
    end
    results
  end

  def self.parse_next_link(link_header)
    return nil unless link_header
    links = link_header.split(',').map { |link| link.split(';') }
    next_link = links.find { |link| link[1].include?('rel="next"') }
    next_link ? next_link[0][/<(.*)>/, 1] : nil
  end

  def self.get_courses(user_id, enrollment_state = nil)
    url = "#{CANVAS_API_BASE_URL}/users/#{user_id}/courses"
    params = {}
    params[:enrollment_state] = enrollment_state if enrollment_state
    url += "?#{URI.encode_www_form(params)}" unless params.empty?

    courses = paginated_get(url)
    courses.map do |course|
      {
        id: course['id'],
        course_code: course['course_code'],
        title: course['name'],
        enrollment_term_id: course['enrollment_term_id'],
        semester: TERM_MAP[course['enrollment_term_id']] || 'Unknown Term'
      }
    end.reject { |course| course[:course_code].nil? || course[:title].nil? || course[:semester] == 'Unknown Term' }
  end

  def self.get_course_assignments(course_id)
    url = "#{CANVAS_API_BASE_URL}/courses/#{course_id}/assignments"
    assignments = paginated_get(url)
    assignments.map { |assignment| { name: assignment['name'], due_at: assignment['due_at'] } }
  end

  def self.get_current_user
    url = "#{CANVAS_API_BASE_URL}/users/self"
    response = HTTParty.get(url, headers: HEADERS)
    if response.success?
      user_info = JSON.parse(response.body)
      puts "User ID: #{user_info['id']}"
      puts "User Name: #{user_info['name']}"
      user_info
    else
      handle_error(response)
      nil
    end
  end

  def self.handle_error(response)
    puts "Error: #{response.code} - #{response.message}"
  end

  def self.get_enrollments(course_id)
    url = "#{CANVAS_API_BASE_URL}/courses/#{course_id}/enrollments"
    enrollments = paginated_get(url)
    enrollments.map do |enrollment|
      {
        name: enrollment['user']['name'],
        role: case enrollment['role']
              when 'TaEnrollment' then 'TA'
              when 'GraderEnrollment' then 'Grader'
              when 'StudentEnrollment' then 'Student'
              when 'TeacherEnrollment' then 'Teacher'
              else enrollment['role']
              end
      }
    end
  end
end

# Convert the due date to the desired format: month/day/year and time, with 4 hours subtracted
def format_due_date(due_at)
  return '' unless due_at

  # Parse the due_at into a Time object
  parsed_time = Time.parse(due_at) rescue nil
  return '' unless parsed_time

  # Subtract 4 hours from the parsed time
  adjusted_time = parsed_time - (4 * 60 * 60)

  # Return formatted date in the desired format
  adjusted_time.strftime('%m/%d/%Y %I:%M %p')
end

# Generate or append assignments to the HTML file, splitting into Past Due and Upcoming Assignments
def generate_html(course, assignments, course_name, append: false)
  mode = append ? 'a' : 'w'  # 'w' for write, 'a' for append
  File.open("index.html", mode) do |file|
    
    file.puts "<body>" unless append
    file.puts "<h2>To-Do List for #{course_name}</h2>"

    past_due = []
    upcoming = []
    current_time = Time.now

    # Categorize assignments
    assignments.each do |assignment|
      due_date_str = assignment[:due_at]
      due_date = Time.parse(due_date_str) rescue nil
      next unless due_date  # skip assignments without valid due dates

      if due_date < current_time
        past_due << assignment
      else
        upcoming << assignment
      end
    end
    past_due = past_due.sort_by { |assignment| Time.parse(assignment[:due_at]) }
    upcoming = upcoming.sort_by { |assignment| Time.parse(assignment[:due_at]) }

    # Display Past Due Assignments
    if past_due.any?
      file.puts "<h3>Past Due</h3><u1><table>"

      numPastDue = past_due.length - 3
      past_due.each do |assignment|
        numPastDue = numPastDue - 1
        if numPastDue < 0
          due_date = format_due_date(assignment[:due_at])
          file.puts "<tr>"
          file.puts "<td style='width: 625px; padding-right: 20px;'>#{assignment[:name]}</td>"
          file.puts "<td>(Due: #{due_date})</td>"
          file.puts "<td><input type=\"checkbox\"></td>"
          file.puts "</tr>"
        end
      end
    
      file.puts "</table>"
    end

    # Display Upcoming Assignments
    
    if upcoming.any?
      file.puts "<h3>Upcoming Assignments</h3>"
      file.puts "<table>"
      numUpDue = 5
      upcoming.each do |assignment|
        if numUpDue > 0
          numUpDue = numUpDue - 1
          due_date = format_due_date(assignment[:due_at])
          file.puts "<tr>"
          file.puts "<td style='width: 625px; padding-right: 20px;'>#{assignment[:name]}</td>"
          file.puts "<td>(Due: #{due_date})</td>"
          file.puts "<td><input type=\"checkbox\"></td>"
          file.puts "</tr>"
        end
      end
      
      file.puts "</table>"
    end

    file.puts "<h3>Need Help? Reach out to these people!</h3>"
    enrollments = CanvasAPI.get_enrollments(course[:id])
    proffessor = ""
    count = 0
    if enrollments.any?
      enrollments.each do |enrollment|
        if enrollment[:role] == "TA" || enrollment[:role] == "Grader"
         file.puts "<l1>#{enrollment[:name]} (#{enrollment[:role]})</l1>"
         count = count + 1
        else
         proffessor = enrollment[:name]
        end
      end
    end
    if count == 0
      file.puts "<l1>Sorry there are no TA's or graders found for this class.</l1>"
      file.puts "<l1>Contact course instructor #{proffessor} if you need any help"
    end

    file.puts "</body></html>" unless append
  end
  puts "Assignments for '#{course_name}' added to the HTML file."
end

if __FILE__ == $PROGRAM_NAME
  current_user = CanvasAPI.get_current_user
  File.open('index.html', 'w') do |file|
    file.puts "<html><head><title>#{current_user['name']}'s to-do list</title></head><h1>Welcome to #{current_user['name']}'s to-do list</h1>"
  end
  puts "Welcome to the To-Do list maker!"
  puts "Please choose the course you would like to make a To-Do list for."

  if current_user
    puts "\nCURRENT SEMESTER COURSES:"
    current_courses = CanvasAPI.get_courses(current_user['id'], 'active')
    

    if current_courses.empty?
      puts "No active courses found."
    else
      selected_courses = []

      loop do
        # Display the active courses and semesters that haven't been selected yet
        available_courses = current_courses.reject { |course| selected_courses.include?(course) }
        if available_courses.empty?
          puts "All courses have been processed."
          break
        end

        available_courses.each_with_index do |course, index|
          puts "#{index + 1}. #{course[:title]} (#{course[:semester]})"
        end

        puts "\nEnter the number corresponding to the class you want a to-do list for (after each number press enter):"
        puts "Or enter -1 to generate a to-do list for all courses."
        selected_index = gets.to_i - 1
        
        if selected_index == -2  # This is the case for -1 input
          available_courses.each do |course|
            selected_courses << course
            course_name = course[:title]
        
            # Fetch assignments for each course
            assignments = CanvasAPI.get_course_assignments(course[:id])
            if assignments.any?
              generate_html(course, assignments, course_name, append: !selected_courses.empty?)
            else
              puts "No assignments found for #{course_name}."
            end
          end
        elsif selected_index.between?(0, available_courses.length - 1)
          selected_course = available_courses[selected_index]
          selected_courses << selected_course
          course_name = selected_course[:title]
        
          # Fetch assignments for the selected course
          assignments = CanvasAPI.get_course_assignments(selected_course[:id])
          if assignments.any?
            generate_html(selected_course, assignments, course_name, append: !selected_courses.empty?)
          else
            puts "No assignments found for #{course_name}."
          end
        else
          puts "Invalid selection."
        end

        # Ask the user if they want to select another course
        puts "\nDo you want to display another class's to-do list? (y/n)"
        continue = gets.strip.downcase
        break if continue != 'y'
      end
    end
  end
end
